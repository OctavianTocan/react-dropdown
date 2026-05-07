/**
 * @file types.ts
 * @brief TypeScript interfaces for the reusable dropdown system
 */

import type { ReactNode } from "react";

/**
 * @brief Supported dropdown placement options relative to the trigger
 */
export type DropdownPlacement = "bottom" | "top" | "auto";

/**
 * @brief Horizontal alignment of the dropdown content to the trigger.
 *
 * - `'start'` — left edge of content aligned to left edge of anchor
 * - `'center'` — content horizontally centered over the anchor
 * - `'end'` — right edge of content aligned to right edge of anchor (default;
 *   matches the historical behavior before the prop existed)
 */
export type DropdownAlign = "start" | "center" | "end";

/**
 * @brief Animation state for the dropdown
 */
export type DropdownAnimationState = "entering" | "exiting" | "idle";

/**
 * @brief Cubic-bezier easing curve, expressed as a 4-tuple of control points.
 *
 * Matches Motion's `Easing` 4-array signature so values can be passed through
 * to `transition.ease` without conversion.
 */
export type DropdownEasing = readonly [number, number, number, number];

/**
 * @brief Event handler for the dropdown's auto-focus lifecycle hooks.
 *
 * Mirrors Radix's `onOpenAutoFocus` / `onCloseAutoFocus` semantics: the
 * handler receives an event-like object with `preventDefault()`. Calling
 * `preventDefault()` opts the consumer out of the dropdown's default focus
 * behavior (focus first interactive child on open, restore to trigger on close).
 */
export type DropdownAutoFocusHandler = (event: { preventDefault: () => void }) => void;

/**
 * @brief Metadata used to render grouped sections inside the dropdown list
 */
export interface DropdownSectionMeta {
  /** Stable identifier for the section used as React key */
  key: string;
  /** Human-readable label for the section header */
  label: string;
  /** Optional helper text describing the section */
  description?: string;
  /** Optional icon rendered next to the section label */
  icon?: ReactNode;
}

/**
 * @brief Base props for all dropdown components
 */
export interface BaseDropdownProps {
  /** Optional CSS class name for custom styling */
  className?: string;
  /** Optional test identifier for automated testing */
  "data-testid"?: string;
  /** Optional children elements */
  children?: ReactNode;
}

/**
 * @brief Props for DropdownRoot component
 *
 * @example Basic usage
 * ```tsx
 * <Dropdown.Root
 *   items={items}
 *   selectedItem={selected}
 *   onSelect={setSelected}
 *   getItemKey={(item) => item.id}
 *   getItemDisplay={(item) => item.label}
 * >
 *   <Dropdown.Trigger displayValue={selected?.label ?? ''} />
 *   <Dropdown.Simple />
 * </Dropdown.Root>
 * ```
 */
export interface DropdownRootProps<T> extends BaseDropdownProps {
  /**
   * Array of items to display. Accepts both mutable and readonly arrays.
   * @example
   * ```tsx
   * const items = [{ id: '1', label: 'Option 1' }, { id: '2', label: 'Option 2' }];
   * <Dropdown.Root items={items} ... />
   * ```
   */
  items: readonly T[];
  /** Currently selected item */
  selectedItem?: T | null;
  /**
   * Callback invoked when selection changes
   * @example
   * ```tsx
   * <Dropdown.Root onSelect={(item) => setSelected(item)} ... />
   * ```
   */
  onSelect: (item: T) => void;
  /**
   * Function to get unique key for each item
   * @example
   * ```tsx
   * <Dropdown.Root getItemKey={(item) => item.id} ... />
   * ```
   */
  getItemKey: (item: T) => string;
  /**
   * Function to get display text for each item
   * @example
   * ```tsx
   * <Dropdown.Root getItemDisplay={(item) => item.label} ... />
   * ```
   */
  getItemDisplay: (item: T) => string;
  /**
   * Optional function to filter items based on search query
   * @example
   * ```tsx
   * <Dropdown.Root
   *   filterItems={(items, query) =>
   *     items.filter(item => item.label.toLowerCase().includes(query.toLowerCase()))
   *   }
   *   ...
   * />
   * ```
   */
  filterItems?: (items: readonly T[], query: string) => T[];
  /** Whether the dropdown is disabled */
  disabled?: boolean;
  /** Optional placeholder text for trigger */
  placeholder?: string;
  /**
   * Dropdown placement relative to the trigger.
   * - 'bottom': Always opens downward
   * - 'top': Always opens upward
   * - 'auto': Automatically detects best placement based on viewport position
   * Default: 'bottom'
   * @example
   * ```tsx
   * <Dropdown.Root placement="auto" ... />
   * ```
   */
  placement?: DropdownPlacement;
  /** @deprecated Use `placement` instead. Will be removed in next major version. */
  dropdownPlacement?: DropdownPlacement;
  /** Distance in pixels between trigger and dropdown content. Default: 8 */
  offset?: number;
  /**
   * Horizontal alignment of the content to the anchor (trigger or anchorRef).
   * Default: `'end'` (right-edge alignment, matching the original behavior).
   */
  align?: DropdownAlign;
  /**
   * Pixel offset added to the alignment axis. Useful when the visual anchor
   * inside the trigger differs from its bounding-box edge. Default: 0.
   */
  alignOffset?: number;
  /**
   * Optional function to retrieve description text shown beneath the label
   * @example
   * ```tsx
   * <Dropdown.Root getItemDescription={(item) => item.description} ... />
   * ```
   */
  getItemDescription?: (item: T) => string | null | undefined;
  /**
   * Optional function to retrieve an icon rendered alongside the label
   * @example
   * ```tsx
   * <Dropdown.Root getItemIcon={(item) => <Icon name={item.icon} />} ... />
   * ```
   */
  getItemIcon?: (item: T) => ReactNode;
  /**
   * Optional function to group items under labeled section headers
   * @example
   * ```tsx
   * <Dropdown.Root
   *   getItemSection={(item) => ({
   *     key: item.category,
   *     label: item.category,
   *     icon: '📁'
   *   })}
   *   ...
   * />
   * ```
   */
  getItemSection?: (item: T) => DropdownSectionMeta | null | undefined;
  /**
   * Optional `(item, index) => boolean` — return true to render a divider ABOVE
   * this item. Suppressed when the item would land at the top of the list (or
   * the top of its section), since a divider with nothing above it is rarely
   * what the consumer means.
   * @example
   * ```tsx
   * // Mark "advanced" items so a separator appears above the first one.
   * getItemSeparator={(item) => item.category === 'advanced'}
   * ```
   */
  getItemSeparator?: (item: T, index: number) => boolean;
  /** Optional function to determine if item is disabled */
  getItemDisabled?: (item: T) => boolean;
  /** Optional function to get custom className for item */
  getItemClassName?: (item: T, isSelected: boolean, isDisabled: boolean) => string;
  /**
   * Whether to close the dropdown automatically when an item is selected.
   * Default: true. Set to false to keep dropdown open after selection (useful for multi-select scenarios).
   */
  closeOnSelect?: boolean;
  /** Optional callback invoked when dropdown open state changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** Ref to the trigger element for portal positioning */
  triggerRef?: React.RefObject<HTMLElement | null>;
  /**
   * Whether to render dropdown in a portal (avoids overflow clipping)
   * @example
   * ```tsx
   * <Dropdown.Root usePortal={true} ... />
   * ```
   */
  usePortal?: boolean;
  /** Duration in seconds for enter animation. Default: 0.2 */
  enterDuration?: number;
  /** Duration in seconds for exit animation. Default: 0.15 */
  exitDuration?: number;
  /**
   * Cubic-bezier easing curve for the enter motion. Default: `[0.16, 1, 0.3, 1]`
   * (gentle ease-out-expo). Pass a different curve when the surrounding UI
   * uses a distinct motion language.
   */
  enterEase?: DropdownEasing;
  /**
   * Cubic-bezier easing curve for the exit motion. Default matches `enterEase`,
   * but a faster fast-out curve (e.g. `[0.4, 0, 1, 1]`) often feels more
   * responsive on close.
   */
  exitEase?: DropdownEasing;
  /**
   * Optional ref to an element that should serve as the visual anchor for
   * positioning, distinct from the click target (`triggerRef`). Defaults to
   * the trigger when not provided. Useful when the dropdown should align to
   * a different element than the one that opens it (e.g. a hidden-hotkey
   * trigger anchored to a visible toolbar).
   */
  anchorRef?: React.RefObject<HTMLElement | null>;
  /**
   * Called when the dropdown opens, BEFORE focus is moved into the content.
   * Call `event.preventDefault()` to opt out of the default behavior (focus
   * the first interactive child).
   */
  onOpenAutoFocus?: DropdownAutoFocusHandler;
  /**
   * Called when the dropdown closes, BEFORE focus is restored to the
   * trigger. Call `event.preventDefault()` to route focus elsewhere.
   */
  onCloseAutoFocus?: DropdownAutoFocusHandler;
  /**
   * Whether to honor the user's `prefers-reduced-motion` system setting and
   * collapse scale/y motion to opacity-only fades when set. Default: `true`.
   * Pass `false` to force the full motion regardless of OS preference.
   */
  respectReducedMotion?: boolean;
  /**
   * When `true` and `placement` is `'bottom'` or `'top'`, the dropdown flips
   * to the opposite side if the requested placement would overflow the
   * viewport on open. Default: `true`. Already implied by `placement: 'auto'`.
   */
  collisionDetection?: boolean;
}

/**
 * @brief Props for DropdownTrigger component
 */
export interface DropdownTriggerProps extends BaseDropdownProps {
  /** Display text to show in trigger */
  displayValue: string;
  /** Placeholder text when no value is selected */
  placeholder?: string;
}

/**
 * @brief Props for DropdownContent component (pure container)
 */
export interface DropdownContentProps extends BaseDropdownProps {
  /** Disable animations (useful for mobile or performance) */
  disableAnimation?: boolean;
  /** Whether to render dropdown in a portal. Default: false */
  portal?: boolean;
  /** Custom container element for portal rendering. Default: document.body */
  portalContainer?: Element;
  /** Whether to show a backdrop behind the dropdown. Default: false */
  backdrop?: boolean;
  /** Custom className for the backdrop element */
  backdropClassName?: string;
}

/**
 * @brief Props for DropdownSearch component
 */
export interface DropdownSearchProps extends BaseDropdownProps {
  /** Current search query */
  value: string;
  /** Callback when search query changes */
  onChange: (value: string) => void;
  /** Ref for input element */
  inputRef?: React.RefObject<HTMLInputElement>;
  /** Placeholder text for search input */
  placeholder?: string;
}

/**
 * @brief Props for DropdownList component
 */
export interface DropdownListProps<T> extends BaseDropdownProps {
  /** Items to display in list. Accepts both mutable and readonly arrays. */
  items: readonly T[];
  /** Optional callback when item is selected. If not provided, uses context's onSelect */
  onSelect?: (item: T) => void;
  /** Whether there are results to display */
  hasResults: boolean;
  /** Currently selected item */
  selectedItem?: T | null;
  /** Function to get unique key for each item */
  getItemKey: (item: T) => string;
  /** Function to get display text for each item */
  getItemDisplay: (item: T) => string;
  /** Optional custom render function for items */
  renderItem?: (item: T, isSelected: boolean, onSelect: (item: T) => void) => ReactNode;
  /** Optional function for displaying supporting description text */
  getItemDescription?: (item: T) => string | null | undefined;
  /** Optional function for rendering an icon element before the label */
  getItemIcon?: (item: T) => ReactNode;
  /** Optional function for grouping items into section headers */
  getItemSection?: (item: T) => DropdownSectionMeta | null | undefined;
  /**
   * Optional `(item, index) => boolean` — return true to render a divider ABOVE
   * this item. Suppressed when the item would land at the top of the list (or
   * the top of its section), since a divider with nothing above it is rarely
   * what the consumer means.
   * @example
   * ```tsx
   * // Mark "advanced" items so a separator appears above the first one.
   * getItemSeparator={(item) => item.category === 'advanced'}
   * ```
   */
  getItemSeparator?: (item: T, index: number) => boolean;
  /** Optional function to determine if item is disabled */
  getItemDisabled?: (item: T) => boolean;
  /** Optional function to get custom className for item */
  getItemClassName?: (item: T, isSelected: boolean, isDisabled: boolean) => string;
  /** Whether to use staggered animations for list items. Default: false */
  staggered?: boolean;
  /** Delay in seconds between each item animation when staggered is true. Default: 0.04 */
  staggerDelay?: number;
  /**
   * Optional index of the currently keyboard-focused item. When provided,
   * the matching `<li>` receives `data-focused="true"` and (when
   * `getItemId` is also provided) its id can be referenced from the parent's
   * `aria-activedescendant`. Used by `DropdownMenu` to wire roving keyboard
   * navigation.
   */
  focusedIndex?: number;
  /**
   * Optional accessor returning a stable HTML id for each item — required for
   * the parent's `aria-activedescendant` reference to resolve to a real DOM
   * element. Defaults to a derived `dropdown-item-${getItemKey(item)}`.
   */
  getItemId?: (item: T, index: number) => string;
  /**
   * Optional callback fired when the pointer enters an item, so consumers
   * can keep keyboard focus and pointer focus in sync (the typical menu UX
   * is: hovering an item makes it the active descendant).
   */
  onItemPointerEnter?: (index: number) => void;
}

/**
 * @brief Props for DropdownOption component
 */
export interface DropdownOptionProps<T> extends BaseDropdownProps {
  /** Item to display */
  item: T;
  /** Callback when option is selected */
  onSelect: (item: T) => void;
  /** Whether this option is currently selected */
  isSelected: boolean;
  /** Display text for the option */
  displayText: string;
  /** Data key attribute for the option */
  dataKey: string;
  /** Optional supporting description shown under the primary label */
  description?: string | null;
  /** Optional icon element rendered before the label */
  icon?: ReactNode;
  /** Whether this option is disabled */
  isDisabled?: boolean;
  /** Optional custom className for the option */
  className?: string;
}

/**
 * @brief Props for DropdownHeader component
 */
export interface DropdownHeaderProps extends BaseDropdownProps {
  /** Whether to show a separator line below the header. Default: false */
  separator?: boolean;
}

/**
 * @brief Props for DropdownFooter component
 */
export interface DropdownFooterProps extends BaseDropdownProps {
  /** Whether to show a separator line above the footer. Default: true */
  separator?: boolean;
}

/**
 * @brief Dropdown context value interface
 */
export interface DropdownContextValue<T> {
  /** Current open/closed state */
  isOpen: boolean;
  /** Function to set open state */
  setIsOpen: (open: boolean) => void;
  /** Currently selected item */
  selectedItem: T | null;
  /** Function to set selected item */
  setSelectedItem: (item: T | null) => void;
  /** Current search query */
  searchQuery: string;
  /** Function to set search query */
  setSearchQuery: (query: string) => void;
  /** Items to display */
  items: readonly T[];
  /** Filtered items based on search query */
  filteredItems: T[];
  /** Function to get unique key for each item */
  getItemKey: (item: T) => string;
  /** Function to get display text for each item */
  getItemDisplay: (item: T) => string;
  /** Function to filter items based on search query */
  filterItems: (items: T[], query: string) => T[];
  /** Callback when item is selected */
  onSelect: (item: T) => void;
  /** Whether the dropdown is disabled */
  disabled: boolean;
  /** Whether to close dropdown on selection */
  closeOnSelect: boolean;
  /** Function to close dropdown with exit animation */
  closeDropdown: () => void;
  /** Function to close dropdown immediately without exit animation */
  closeImmediate: () => void;
  /** Function to toggle dropdown open/closed state */
  toggleDropdown: () => void;
  /** Current animation state of the dropdown */
  animationState: DropdownAnimationState;
  /** Computed placement after auto-detection (always 'top' or 'bottom') */
  computedPlacement: "top" | "bottom";
  /** @deprecated Use computedPlacement instead */
  dropdownPlacement?: DropdownPlacement;
  /** Distance in pixels between trigger and dropdown content */
  offset: number;
  /** Horizontal alignment of content to anchor */
  align: DropdownAlign;
  /** Pixel offset added to the alignment axis */
  alignOffset: number;
  /** Optional function to retrieve supporting descriptions */
  getItemDescription?: (item: T) => string | null | undefined;
  /** Optional function to retrieve icon elements */
  getItemIcon?: (item: T) => ReactNode;
  /** Optional function to group items by section metadata */
  getItemSection?: (item: T) => DropdownSectionMeta | null | undefined;
  /**
   * Optional `(item, index) => boolean` — return true to render a divider ABOVE
   * this item. Suppressed when the item would land at the top of the list (or
   * the top of its section), since a divider with nothing above it is rarely
   * what the consumer means.
   * @example
   * ```tsx
   * // Mark "advanced" items so a separator appears above the first one.
   * getItemSeparator={(item) => item.category === 'advanced'}
   * ```
   */
  getItemSeparator?: (item: T, index: number) => boolean;
  /** Optional function to determine if item is disabled */
  getItemDisabled?: (item: T) => boolean;
  /** Optional function to get custom className for item */
  getItemClassName?: (item: T, isSelected: boolean, isDisabled: boolean) => string;
  /** Ref to the trigger element for portal positioning */
  triggerRef?: React.RefObject<HTMLElement | null>;
  /** Whether to render dropdown in a portal */
  usePortal?: boolean;
  /** Duration in seconds for enter animation */
  enterDuration: number;
  /** Duration in seconds for exit animation */
  exitDuration: number;
  /** Cubic-bezier easing for the enter motion */
  enterEase: DropdownEasing;
  /** Cubic-bezier easing for the exit motion */
  exitEase: DropdownEasing;
  /**
   * Optional ref to an element that should serve as the visual anchor for
   * positioning, distinct from the click target. When unset, positioning
   * falls back to `triggerRef`.
   */
  anchorRef?: React.RefObject<HTMLElement | null>;
  /** Called immediately before focus is moved into the dropdown on open. */
  onOpenAutoFocus?: DropdownAutoFocusHandler;
  /** Called immediately before focus is restored to the trigger on close. */
  onCloseAutoFocus?: DropdownAutoFocusHandler;
  /** Whether to honor the OS-level `prefers-reduced-motion` setting. */
  respectReducedMotion: boolean;
  /** Whether viewport-collision flipping is enabled for explicit placements. */
  collisionDetection: boolean;
}

/**
 * Discriminated union for heterogeneous menu items used by {@link DropdownMenuDef}.
 *
 * Each variant maps to a distinct rendered element:
 * - `'label'`     — non-interactive section header text
 * - `'action'`    — clickable button that invokes `onClick` and closes the menu
 * - `'submenu'`   — inline accordion that expands to reveal nested children
 * - `'separator'` — thin horizontal rule between groups of items
 */
export type MenuItemDef =
  | { type: 'label'; text: string }
  | {
      type: 'action';
      id: string;
      label: string;
      /** Optional icon rendered to the left of the label. */
      icon?: ReactNode;
      /** Optional keyboard shortcut hint rendered on the right. */
      shortcut?: string;
      onClick: () => void;
      disabled?: boolean;
    }
  | {
      type: 'submenu';
      id: string;
      label: string;
      /** Optional icon rendered to the left of the label. */
      icon?: ReactNode;
      /**
       * Nested items rendered as an inline accordion. Arbitrary depth — each
       * `SubmenuRow` owns its own accordion state for its direct children, so
       * a 4-level menu toggles cleanly without level-1 state being shared
       * with level-3 state.
       */
      children: readonly MenuItemDef[];
    }
  | { type: 'separator' };
