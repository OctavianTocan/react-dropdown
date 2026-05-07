/**
 * @file useDropdown.ts
 * @brief Headless dropdown hook with prop getters
 *
 * Exposes open/close state, focus tracking, and a set of prop-getter functions
 * (`getTriggerProps`, `getContentProps`, `getItemProps`) so consumers can fully
 * own the markup while the hook handles the keyboard, ARIA, and click-outside
 * mechanics. Inspired by Headless UI's `Menu` and Downshift's `useSelect`.
 *
 * Contract
 * --------
 * - The hook is pure — no portal, no animation, no DOM mutation outside of
 *   the click-outside listener it subscribes to while open. Pair it with
 *   your own JSX (and optionally a portal helper) when you need a dropdown
 *   that doesn't fit the bundled component shells.
 * - The returned prop getters spread their result onto the consumer's element:
 *
 *   ```tsx
 *   const { isOpen, getTriggerProps, getContentProps, getItemProps } = useDropdown({ items });
 *   <button {...getTriggerProps({ ref: myRef })}>Open</button>
 *   {isOpen && (
 *     <ul {...getContentProps()}>
 *       {items.map((item, i) => (
 *         <li key={item.id} {...getItemProps({ index: i, onSelect: () => doThing(item) })}>
 *           {item.label}
 *         </li>
 *       ))}
 *     </ul>
 *   )}
 *   ```
 *
 * - Each prop getter accepts an optional `userProps` argument. Every event
 *   handler in `userProps` is called BEFORE the hook's internal handler; if
 *   the user calls `event.preventDefault()`, the hook's default behavior is
 *   skipped (Radix-style prop merging).
 * - `getTriggerProps({ ref })` composes the consumer's ref with the hook's
 *   internal trigger ref so click-outside detection still works.
 *
 * Keyboard model
 * --------------
 * Reuses the existing {@link useMenuKeyboard} hook for type-ahead, arrow keys,
 * Home/End, and Enter/Escape. `focusedIndex` is the source of truth for ARIA
 * `aria-activedescendant` wiring and visual highlight. Activation (Enter /
 * Space) on a focused item synthesizes a `click()` on the matching DOM
 * element; the click then routes through the item's `onClick` handler synthesized
 * by `getItemProps`, which calls the consumer's `onSelect`. This mirrors the
 * Headless UI / Reach UI approach and means the consumer registers selection
 * once per row instead of in two places.
 *
 * Design rationale
 * ----------------
 * - Hook is **additive** to the existing component API — it does NOT drive
 *   `DropdownRoot`/`DropdownContent`/`DropdownTrigger`. Unifying the two APIs
 *   on a single hook is a separate refactor (deferred) so the 130+ existing
 *   tests stay frozen during this iteration.
 * - The hook is fully agnostic of styling, motion, and portal strategy. That
 *   keeps it usable in both opaque-popover and frosted-glass surfaces without
 *   coupling to either.
 */

"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type Ref,
} from "react";
import { useMenuKeyboard } from "./useMenuKeyboard";
import { useToggleState } from "./useToggleState";

/**
 * Compose two refs into a single callback ref.
 *
 * Required when `getTriggerProps({ ref })` accepts a consumer ref while the
 * hook also needs to track the trigger element internally for click-outside
 * detection.
 */
function composeRefs<T>(...refs: ReadonlyArray<Ref<T> | undefined>): (node: T | null) => void {
  return (node: T | null): void => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") {
        ref(node);
      } else {
        // biome-ignore lint/suspicious/noExplicitAny: writable mutable refs require a one-line escape; ref types are correct at the callsite.
        (ref as any).current = node;
      }
    }
  };
}

/** Configuration accepted by {@link useDropdown}. */
export interface UseDropdownOptions<T> {
  /**
   * Items the dropdown will render. Must be stable across renders to avoid
   * thrashing the keyboard navigator. Typically memoized at the call site.
   */
  items: readonly T[];
  /**
   * Optional accessor used by type-ahead matching. Defaults to `String(item)`.
   */
  getItemLabel?: (item: T) => string;
  /**
   * Optional accessor used to mark items as disabled. Disabled items are
   * skipped during keyboard traversal and clicks on them are no-ops.
   */
  getItemDisabled?: (item: T) => boolean;
  /**
   * Whether the dropdown is initially open. Default: `false`.
   */
  defaultOpen?: boolean;
  /**
   * Optional callback fired when the dropdown opens or closes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Whether to close the dropdown after an item is selected. Default: `true`.
   * Set to `false` for multi-select pickers where consecutive selections are
   * the typical interaction.
   */
  closeOnSelect?: boolean;
  /**
   * Optional id prefix for items. The hook auto-generates one if omitted; set
   * this only when you need a deterministic id (e.g. for SSR-stable markup).
   */
  idPrefix?: string;
}

/**
 * Argument accepted by {@link UseDropdownReturn.getTriggerProps}. The optional
 * `ref` is composed with the hook's internal trigger ref via {@link composeRefs}.
 */
export interface GetTriggerPropsArg
  extends Omit<HTMLAttributes<HTMLElement>, "ref" | "onClick" | "onKeyDown"> {
  /** Optional consumer ref — composed with the hook's internal trigger ref. */
  ref?: Ref<HTMLElement>;
  /** Consumer click handler — runs BEFORE the hook's open/close toggle. */
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
  /** Consumer keydown handler — runs BEFORE the hook's keyboard logic. */
  onKeyDown?: (event: ReactKeyboardEvent<HTMLElement>) => void;
}

/** Argument accepted by {@link UseDropdownReturn.getContentProps}. */
export interface GetContentPropsArg
  extends Omit<HTMLAttributes<HTMLElement>, "ref" | "onKeyDown"> {
  /** Optional consumer ref — composed with the hook's internal content ref. */
  ref?: Ref<HTMLElement>;
  /** Consumer keydown handler — runs BEFORE the hook's keyboard logic. */
  onKeyDown?: (event: ReactKeyboardEvent<HTMLElement>) => void;
}

/** Argument accepted by {@link UseDropdownReturn.getItemProps}. */
export interface GetItemPropsArg
  extends Omit<HTMLAttributes<HTMLElement>, "onClick" | "onMouseEnter"> {
  /** Zero-based index of the item in the `items` array. Required. */
  index: number;
  /**
   * Callback fired when the item is selected (clicked or activated via keyboard).
   * The hook closes the dropdown afterward unless `closeOnSelect` is `false`.
   */
  onSelect?: () => void;
  /** Optional override for the per-item disabled state. */
  disabled?: boolean;
  /** Consumer click handler — runs BEFORE `onSelect`. */
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
  /** Consumer mouseenter handler — runs BEFORE the hook's focus sync. */
  onMouseEnter?: (event: ReactMouseEvent<HTMLElement>) => void;
}

/** Shape returned by {@link useDropdown}. */
export interface UseDropdownReturn<T> {
  /** Whether the dropdown is currently open. */
  isOpen: boolean;
  /** Open the dropdown. No-op if already open. */
  open: () => void;
  /** Close the dropdown. No-op if already closed. */
  close: () => void;
  /** Toggle the dropdown's open state. */
  toggle: () => void;
  /**
   * Index of the currently focused item, or `-1` when nothing is focused.
   * Drives `aria-activedescendant` on the content element.
   */
  focusedIndex: number;
  /** Imperatively change the focused index — e.g. on hover or scroll. */
  setFocusedIndex: (index: number) => void;
  /**
   * Returns props for the trigger element. Spread onto the consumer's
   * `<button>`, `<a>`, or other interactive element.
   */
  getTriggerProps: (userProps?: GetTriggerPropsArg) => HTMLAttributes<HTMLElement> & {
    ref: (node: HTMLElement | null) => void;
    "aria-haspopup": "menu";
    "aria-expanded": boolean;
    "aria-controls": string;
  };
  /**
   * Returns props for the content panel. Spread onto the consumer's `<ul>`,
   * `<div role="menu">`, or any container.
   */
  getContentProps: (userProps?: GetContentPropsArg) => HTMLAttributes<HTMLElement> & {
    ref: (node: HTMLElement | null) => void;
    id: string;
    role: "menu";
    tabIndex: number;
    "aria-activedescendant": string | undefined;
  };
  /**
   * Returns props for a single item element. Spread onto each row.
   * `index` is required so the hook can wire keyboard navigation.
   */
  getItemProps: (arg: GetItemPropsArg) => HTMLAttributes<HTMLElement> & {
    id: string;
    role: "menuitem";
    "data-focused"?: "true";
    "data-disabled"?: "true";
  };
  /** Stable id assigned to the content element (also used in item ids). */
  contentId: string;
}

/**
 * Headless dropdown hook with prop getters. See the file header for usage and
 * the contract.
 *
 * @typeParam T - Shape of each item in the dropdown. The hook is generic so
 *   the consumer's data type flows through to `getItemDisabled` /
 *   `getItemLabel` without casting.
 *
 * @param options - Items and behavior toggles. Items must be stable across
 *   renders for the keyboard navigator to behave deterministically.
 * @returns State, imperative controls, and prop getters for the trigger,
 *   content panel, and items.
 */
export function useDropdown<T>(options: UseDropdownOptions<T>): UseDropdownReturn<T> {
  const {
    items,
    getItemLabel,
    getItemDisabled,
    defaultOpen = false,
    onOpenChange,
    closeOnSelect = true,
    idPrefix,
  } = options;

  const reactGeneratedId = useId();
  const baseId = idPrefix ?? `dropdown-${reactGeneratedId}`;
  const contentId = `${baseId}-content`;

  // Open-state lives in the shared `useToggleState` primitive so all dropdown
  // surfaces (component-driven, headless, panel, context-menu) funnel through
  // a single source of truth for the open transition + onOpenChange contract.
  const { isOpen, setIsOpen, open, close, toggle } = useToggleState({
    defaultOpen,
    onOpenChange,
  });

  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLElement | null>(null);

  const handleClose = useCallback((): void => {
    close();
  }, [close]);

  // Keyboard activation translates to a synthetic click on the matching DOM
  // element so the consumer's per-item onSelect (registered via getItemProps)
  // is the single source of truth for activation. We look up the element by
  // the deterministic id minted in getItemProps.
  const handleActivate = useCallback(
    (item: T): void => {
      const index = items.indexOf(item);
      if (index < 0) return;
      const itemId = `${baseId}-item-${index}`;
      const element = document.getElementById(itemId);
      if (element) element.click();
    },
    [items, baseId],
  );

  // Keyboard navigation is shared with the existing component-driven menu via
  // the public useMenuKeyboard hook. Reusing it keeps focus + type-ahead
  // semantics identical between the headless and component APIs.
  const keyboardApi = useMenuKeyboard({
    items,
    getItemDisabled,
    getItemDisplay: getItemLabel ?? ((item: T): string => String(item)),
    isOpen,
    onActivate: handleActivate,
    onClose: handleClose,
  });

  // Click-outside: close when a click lands outside both the trigger and the
  // content. Subscribed only while open so closed dropdowns don't pay the
  // cost of a global listener. `pointerdown` is intentional here (and
  // distinct from the component-driven `useClickOutside` which uses
  // `mousedown`/`touchstart`) — the headless API is newer and pointer events
  // unify mouse + touch + pen with no per-platform branching.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target)) return;
      if (contentRef.current?.contains(target)) return;
      // setIsOpen handles the onOpenChange-on-transition rule.
      setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return (): void => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen, setIsOpen]);

  const getTriggerProps: UseDropdownReturn<T>["getTriggerProps"] = useCallback(
    (userProps) => {
      const { ref: userRef, onClick: userOnClick, onKeyDown: userOnKeyDown, ...rest } =
        userProps ?? {};

      return {
        ...rest,
        ref: composeRefs<HTMLElement>(triggerRef, userRef),
        "aria-haspopup": "menu",
        "aria-expanded": isOpen,
        "aria-controls": contentId,
        onClick: (event: ReactMouseEvent<HTMLElement>): void => {
          userOnClick?.(event);
          if (event.defaultPrevented) return;
          toggle();
        },
        onKeyDown: (event: ReactKeyboardEvent<HTMLElement>): void => {
          userOnKeyDown?.(event);
          if (event.defaultPrevented) return;
          // The menu opens on ArrowDown / ArrowUp / Enter / Space when focus
          // sits on the trigger — same model as Radix's DropdownMenuTrigger.
          if (
            event.key === "ArrowDown" ||
            event.key === "ArrowUp" ||
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            if (!isOpen) {
              open();
            }
          }
        },
      };
    },
    [isOpen, contentId, open, toggle],
  );

  const getContentProps: UseDropdownReturn<T>["getContentProps"] = useCallback(
    (userProps) => {
      const { ref: userRef, onKeyDown: userOnKeyDown, ...rest } = userProps ?? {};

      // aria-activedescendant must reference an existing DOM id; we mint one
      // per item index in getItemProps below.
      const activeDescendant =
        keyboardApi.focusedIndex >= 0
          ? `${baseId}-item-${keyboardApi.focusedIndex}`
          : undefined;

      return {
        ...rest,
        ref: composeRefs<HTMLElement>(contentRef, userRef),
        id: contentId,
        role: "menu",
        tabIndex: -1,
        "aria-activedescendant": activeDescendant,
        onKeyDown: (event: ReactKeyboardEvent<HTMLElement>): void => {
          userOnKeyDown?.(event);
          if (event.defaultPrevented) return;
          keyboardApi.handleKeyDown(event);
        },
      };
    },
    [keyboardApi, baseId, contentId],
  );

  const getItemProps: UseDropdownReturn<T>["getItemProps"] = useCallback(
    (arg) => {
      const {
        index,
        onSelect,
        disabled: explicitDisabled,
        onClick: userOnClick,
        onMouseEnter: userOnMouseEnter,
        ...rest
      } = arg;

      const item = items[index];
      const itemDisabled =
        explicitDisabled ?? (item !== undefined && getItemDisabled?.(item)) ?? false;
      const itemId = `${baseId}-item-${index}`;
      const isFocused = keyboardApi.focusedIndex === index;

      const props: HTMLAttributes<HTMLElement> & {
        id: string;
        role: "menuitem";
        "data-focused"?: "true";
        "data-disabled"?: "true";
      } = {
        ...rest,
        id: itemId,
        role: "menuitem",
        onClick: (event: ReactMouseEvent<HTMLElement>): void => {
          userOnClick?.(event);
          if (event.defaultPrevented) return;
          if (itemDisabled) return;
          onSelect?.();
          if (closeOnSelect) close();
        },
        onMouseEnter: (event: ReactMouseEvent<HTMLElement>): void => {
          userOnMouseEnter?.(event);
          if (event.defaultPrevented) return;
          if (!itemDisabled) keyboardApi.setFocusedIndex(index);
        },
      };
      if (isFocused) props["data-focused"] = "true";
      if (itemDisabled) {
        props["data-disabled"] = "true";
        props["aria-disabled"] = true;
      }
      return props;
    },
    [items, getItemDisabled, baseId, keyboardApi, closeOnSelect, close],
  );

  return {
    isOpen,
    open,
    close,
    toggle,
    focusedIndex: keyboardApi.focusedIndex,
    setFocusedIndex: keyboardApi.setFocusedIndex,
    getTriggerProps,
    getContentProps,
    getItemProps,
    contentId,
  };
}
