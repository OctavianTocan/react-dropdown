/**
 * @file DropdownSubmenu.tsx
 * @brief Flyout submenu (Radix `DropdownMenuSub` parity)
 *
 * Three-component composition that opens a portaled side panel relative to a
 * parent menu item:
 *
 * - `DropdownSubmenu`, context provider; owns the submenu's open state and
 *   anchor ref.
 * - `DropdownSubmenuTrigger`, the parent menu's item that opens the
 *   submenu. Mirrors `MenuTrigger`'s `asChild` pattern. Includes hover-open,
 *   click-toggle, ArrowRight-open keyboard shortcut.
 * - `DropdownSubmenuContent`, the portaled flyout panel. Reuses the parent
 *   `DropdownContent` motion variants for visual continuity (filter blur,
 *   scale + y motion, ease-in-quint exit) while owning its own anchor ref
 *   so collision-flipping is local to the submenu's space.
 *
 * Nested submenus work because each `DropdownSubmenu` creates its own
 * context, the chain is just nested providers. Click-outside on the root
 * closes everything; Escape inside a sub closes that sub level and returns
 * focus to the parent's trigger.
 */

"use client";

import { createContext, useCallback, use, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useDropdownContext } from "./DropdownContext";
import { Slot } from "./Slot";
import { ELEVATED_SHADOW } from "./design-tokens";
import { MENU_ROW_DISABLED_VISUAL_CLASSNAME } from "./menu-row-disabled-visual";
import { SubmenuChevronIcon } from "./SubmenuChevronIcon";

/** Hover-open delay (ms) before the submenu appears on pointer-enter. */
const HOVER_OPEN_DELAY_MS = 100;
/** Hover-close delay (ms), gives the user time to drift toward the panel. */
const HOVER_CLOSE_DELAY_MS = 200;
/** Inset (px) from the viewport edge when collision-flipping side. */
const VIEWPORT_INSET = 8;

/**
 * @brief Coordinates sibling submenus inside a single parent panel.
 *
 * Without coordination, cycling the cursor between sibling triggers
 * (Status → Labels → More) leaves the previous submenu visible while the
 * next one opens, the trigger's hover-close is delayed by
 * {@link HOVER_CLOSE_DELAY_MS}, but the next trigger's hover-open fires
 * after only {@link HOVER_OPEN_DELAY_MS}, so both panels are visible for
 * ~100 ms plus animation tail. The visible artefact: panels stack on top
 * of each other when the user scrubs the cursor.
 *
 * Each {@link DropdownSubmenu} registers its `close` callback with the
 * group on mount and removes it on unmount. When a submenu opens, it
 * calls `closeOthers(self)` so peers in the same group close
 * immediately.
 *
 * Each {@link DropdownSubmenu} also provides a fresh group to its
 * children, nested submenus only coordinate within their own depth, so
 * opening a sub-sub doesn't accidentally close the sibling sub.
 */
interface SubmenuGroupValue {
  /** Adds `close` to the registry; returns an unregister fn. */
  register: (close: () => void) => () => void;
  /**
   * Closes every registered peer except `self`. Called by a submenu when
   * it opens to evict its siblings.
   */
  closeOthers: (self: () => void) => void;
}

const NOOP_SUBMENU_GROUP: SubmenuGroupValue = {
  register: () => () => {
    // no-op when no provider above (e.g. submenu rendered standalone in tests)
  },
  closeOthers: () => {
    // no-op when no provider above
  },
};

const SubmenuGroupContext = createContext<SubmenuGroupValue>(NOOP_SUBMENU_GROUP);

/**
 * @brief Hook returning the parent submenu-group coordinator.
 *
 * Returns a no-op group when used outside a provider so consumers don't
 * need to wrap their tree explicitly, the coordination just becomes
 * inactive for that subtree.
 */
function useSubmenuGroup(): SubmenuGroupValue {
  return use(SubmenuGroupContext);
}

/**
 * @brief Provider for a submenu peer-group at this nesting level.
 *
 * Wrap a panel's children in this provider so the submenus inside the
 * panel coordinate (auto-close peers when one opens). {@link DropdownSubmenu}
 * already wraps its OWN children in a fresh provider for descendants —
 * external callers usually only need this around the ROOT dropdown
 * panel's children when they want sibling submenus there to coordinate.
 */
export function DropdownSubmenuGroupProvider({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  const closeFnsRef = useRef<Set<() => void>>(new Set());
  const value = useMemo<SubmenuGroupValue>(
    () => ({
      register(close) {
        closeFnsRef.current.add(close);
        return () => {
          closeFnsRef.current.delete(close);
        };
      },
      closeOthers(self) {
        for (const close of closeFnsRef.current) {
          if (close !== self) close();
        }
      },
    }),
    [],
  );
  return <SubmenuGroupContext.Provider value={value}>{children}</SubmenuGroupContext.Provider>;
}

/**
 * @brief Internal context shared by `DropdownSubmenu` and its children.
 */
interface SubmenuContextValue {
  /** Whether this submenu's flyout is open. */
  isOpen: boolean;
  /** Open the submenu (no debouncing). */
  open: () => void;
  /** Close the submenu (no debouncing). */
  close: () => void;
  /** Schedule an open after `HOVER_OPEN_DELAY_MS` (cancellable). */
  scheduleOpen: () => void;
  /** Schedule a close after `HOVER_CLOSE_DELAY_MS` (cancellable). */
  scheduleClose: () => void;
  /** Cancel any pending open/close timers. */
  cancelScheduled: () => void;
  /** Ref to the trigger so the panel can position itself relative to it. */
  triggerRef: React.RefObject<HTMLElement | null>;
}

const SubmenuContext = createContext<SubmenuContextValue | null>(null);

function useSubmenuContext(): SubmenuContextValue {
  const ctx = use(SubmenuContext);
  if (!ctx) {
    throw new Error(
      "DropdownSubmenuTrigger / DropdownSubmenuContent must be rendered inside <DropdownSubmenu>.",
    );
  }
  return ctx;
}

/**
 * @brief Submenu state container, wraps a trigger + content pair.
 *
 * Renders no DOM of its own; just provides the submenu context.
 */
export function DropdownSubmenu({ children }: { children: ReactNode }): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  // Single shared timer ref, schedule overrides cancel cleanly. Critical
  // under spam: if the user moves the cursor on/off the trigger rapidly,
  // each transition resets the pending action so the visible state matches
  // the most recent intent.
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Peer coordinator from the closest ancestor panel, used to evict
  // sibling submenus when this one opens so cycling between Status →
  // Labels → More no longer briefly stacks two flyouts on top of each
  // other.
  const parentGroup = useSubmenuGroup();

  const cancelScheduled = useCallback((): void => {
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  // `closeRef` lets us pass a stable identity to the parent group's
  // register/closeOthers without forcing every sibling to retain a
  // reference to a fresh function each render.
  const closeRef = useRef<() => void>(() => {
    // assigned below, stable identity is what matters for the registry.
  });

  const open = useCallback((): void => {
    cancelScheduled();
    // Evict sibling submenus first; otherwise their pending hover-close
    // (HOVER_CLOSE_DELAY_MS = 200 ms) keeps them painted while we're
    // already opening, briefly stacking two panels.
    parentGroup.closeOthers(closeRef.current);
    setIsOpen(true);
  }, [cancelScheduled, parentGroup]);

  const close = useCallback((): void => {
    cancelScheduled();
    setIsOpen(false);
  }, [cancelScheduled]);

  closeRef.current = close;

  const scheduleOpen = useCallback((): void => {
    cancelScheduled();
    timerRef.current = setTimeout(() => {
      // Same eviction at the actual flip point, handles the case where
      // the user scrubs hover triggers fast enough that several timers
      // were scheduled and the latest one is the survivor.
      parentGroup.closeOthers(closeRef.current);
      setIsOpen(true);
      timerRef.current = undefined;
    }, HOVER_OPEN_DELAY_MS);
  }, [cancelScheduled, parentGroup]);

  const scheduleClose = useCallback((): void => {
    cancelScheduled();
    timerRef.current = setTimeout(() => {
      setIsOpen(false);
      timerRef.current = undefined;
    }, HOVER_CLOSE_DELAY_MS);
  }, [cancelScheduled]);

  // Register this submenu's `close` with the parent group on mount.
  // Identity comes from the closeRef so the registry entry stays stable
  // across re-renders, reference equality is what `closeOthers(self)`
  // depends on to skip the active submenu.
  useEffect(() => {
    return parentGroup.register(closeRef.current);
  }, [parentGroup]);

  // Always clear pending timers on unmount so a stale setTimeout can't
  // setState after the submenu is gone.
  useEffect(() => {
    return cancelScheduled;
  }, [cancelScheduled]);

  const value = useMemo<SubmenuContextValue>(
    () => ({ isOpen, open, close, scheduleOpen, scheduleClose, cancelScheduled, triggerRef }),
    [isOpen, open, close, scheduleOpen, scheduleClose, cancelScheduled],
  );

  return (
    <SubmenuContext.Provider value={value}>
      {/* Fresh group for nested submenus, descendants only coordinate
          with their own siblings, not with this submenu's peers. */}
      <DropdownSubmenuGroupProvider>{children}</DropdownSubmenuGroupProvider>
    </SubmenuContext.Provider>
  );
}

/**
 * @brief Default item styling for {@link DropdownSubmenuTrigger}.
 *
 * Mirrors {@link DropdownMenuItem}'s default class so a bare `<MenuSubTrigger>`
 * renders with the same flex row layout (icon ◯ label ◯ trailing) as a sibling
 * `<MenuItem>`. Without this, consumers that didn't pass a `className` got an
 * unstyled `<button>` whose icon + label collapsed into block flow, labels
 * floated into the middle of the panel detached from their icons (ai-nexus
 * sidebar conversation right-click menu, image #37).
 *
 * Consumer overrides are merged via {@link mergeSubmenuTriggerClassName} so
 * later utilities still win (Tailwind's later-class-wins ordering).
 */
const DEFAULT_SUBMENU_TRIGGER_CLASSNAME =
  "focus:bg-foreground/[0.03] hover:bg-foreground/[0.03] [&>svg:not([class*='text-'])]:text-muted-foreground gap-2 rounded-[4px] px-2 py-1.5 pr-4 text-sm text-left [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:shrink-0 group/dropdown-submenu-trigger relative flex w-full cursor-default items-center outline-hidden select-none data-[state=open]:bg-foreground/[0.03] [&_svg]:pointer-events-none [&_svg]:shrink-0";

function mergeSubmenuTriggerClassName(override: string | undefined): string {
  return override
    ? `${DEFAULT_SUBMENU_TRIGGER_CLASSNAME} ${override}`
    : DEFAULT_SUBMENU_TRIGGER_CLASSNAME;
}

/**
 * @brief Props for `DropdownSubmenuTrigger`.
 */
export interface DropdownSubmenuTriggerProps {
  /**
   * When `true`, props are merged onto the consumer's child element via
   * {@link Slot}. Otherwise renders as a `<button type="button">`.
   */
  asChild?: boolean;
  /** Trigger content. */
  children: ReactNode;
  /** Optional className on the rendered element. */
  className?: string;
  /**
   * When `true`, the trigger is non-interactive and uses the same disabled
   * visuals as {@link DropdownMenuItem}; the submenu does not open.
   */
  disabled?: boolean;
  /**
   * When `true` (default), appends a trailing chevron after `children` in the
   * default `<button>` trigger, signals that the row opens a submenu. Ignored
   * when `asChild` is true (compose your own affordance). Set `false` when the
   * trigger already supplies a trailing slot (e.g. checkmark vs chevron).
   */
  showChevron?: boolean;
}

/**
 * @brief Menu-item-like button that opens the parent's submenu.
 *
 * In the default `<button>` mode, a trailing chevron is appended automatically
 * unless {@link DropdownSubmenuTriggerProps.showChevron} is `false`, callers
 * using `asChild` compose their own trailing affordance.
 *
 * Behavior:
 * - **Click / Enter / Space**: toggle open.
 * - **ArrowRight**: open (Radix convention, submenus open right by default).
 * - **PointerEnter**: schedule open after `HOVER_OPEN_DELAY_MS`.
 * - **PointerLeave**: schedule close after `HOVER_CLOSE_DELAY_MS`, long
 *   enough for the user to drift onto the submenu panel without losing it.
 *
 * The panel itself cancels the close-schedule when the cursor enters it,
 * giving us a simple alternative to Radix's safe-triangle logic.
 *
 * Pass **`disabled`** to render an unavailable submenu entry (no hover-open,
 * no keyboard open, same muted-tray styling as a disabled {@link DropdownMenuItem}).
 */
export function DropdownSubmenuTrigger({
  asChild = false,
  children,
  className,
  disabled = false,
  showChevron = true,
}: DropdownSubmenuTriggerProps): React.JSX.Element {
  const { isOpen, open, close, scheduleOpen, scheduleClose } = useSubmenuContext();
  const localRef = useRef<HTMLElement | null>(null);
  const ctx = useSubmenuContext();
  const setRef = useCallback(
    (node: HTMLElement | null) => {
      localRef.current = node;
      ctx.triggerRef.current = node;
    },
    [ctx],
  );

  const handleClick = useCallback(() => {
    if (disabled) return;
    if (isOpen) close();
    else open();
  }, [disabled, isOpen, open, close]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;
      if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        open();
      }
    },
    [disabled, open],
  );

  const mergedClassName = mergeSubmenuTriggerClassName(
    [className, disabled ? MENU_ROW_DISABLED_VISUAL_CLASSNAME : undefined]
      .filter(Boolean)
      .join(" ") || undefined,
  );

  const handlers = {
    onClick: handleClick,
    onPointerEnter: disabled ? undefined : scheduleOpen,
    onPointerLeave: disabled ? undefined : scheduleClose,
    onKeyDown: handleKeyDown,
    "aria-haspopup": "menu" as const,
    "aria-expanded": isOpen,
    "aria-disabled": disabled,
    "data-state": isOpen ? ("open" as const) : ("closed" as const),
    "data-disabled": disabled ? "" : undefined,
  };

  const trailingChevron =
    !asChild && showChevron ? (
      <span
        aria-hidden
        className="ml-auto flex shrink-0 items-center justify-center text-muted-foreground"
      >
        <SubmenuChevronIcon className="size-3.5" />
      </span>
    ) : null;

  if (asChild) {
    return (
      <Slot ref={setRef} className={mergedClassName} {...handlers}>
        {children}
      </Slot>
    );
  }
  return (
    <button
      type="button"
      ref={setRef as React.Ref<HTMLButtonElement>}
      disabled={disabled}
      className={mergedClassName}
      {...handlers}
    >
      {children}
      {trailingChevron}
    </button>
  );
}

/**
 * @brief Default enter duration (seconds) for submenu motion.
 *
 * Faster than the root dropdown's 0.14 s default, when the user traverses
 * siblings (Anthropic → OpenAI → Google), each panel needs to appear
 * before the previous one finishes exiting or two panels are briefly
 * visible at once. 0.08 s lands inside Linear/Arc territory ("snappy
 * fly-out") and keeps cursor traversal feeling continuous.
 *
 * Override per-content via {@link DropdownSubmenuContentProps.enterDuration}.
 */
const DEFAULT_SUBMENU_ENTER_DURATION = 0.08;

/**
 * @brief Default exit duration (seconds) for submenu motion.
 *
 * Even faster than enter (60 ms) so chained-submenu sequences feel
 * "the previous one is gone before the next one shows" rather than a
 * brief overlap. See {@link DEFAULT_SUBMENU_ENTER_DURATION} for context.
 */
const DEFAULT_SUBMENU_EXIT_DURATION = 0.06;

/**
 * @brief Props for `DropdownSubmenuContent`.
 */
export interface DropdownSubmenuContentProps {
  /** Items / rows to render inside the panel. */
  children: ReactNode;
  /** Optional className for the panel. Falls back to a bare-bones default. */
  className?: string;
  /** Side to open on, default 'right'. Will flip on viewport collision. */
  side?: "right" | "left";
  /** Pixel offset from the trigger's edge on the chosen side. Default: 4. */
  sideOffset?: number;
  /**
   * Enter motion duration (seconds). Defaults to 0.08 s, faster than the
   * root dropdown so chained-submenu cursor traversal feels continuous.
   * Pass `useDropdownContext().enterDuration` when you want submenu motion
   * to match the root explicitly.
   */
  enterDuration?: number;
  /**
   * Exit motion duration (seconds). Defaults to 0.06 s. See
   * {@link enterDuration} for rationale.
   */
  exitDuration?: number;
}

/**
 * @brief Portaled flyout panel for a submenu.
 *
 * Reuses the root dropdown's motion / reduced-motion / ease config via
 * `useDropdownContext()` so visual continuity is automatic. Owns its own
 * collision-flip logic (right ↔ left) keyed on the submenu trigger's rect.
 *
 * Uses a `data-state` attribute on the rendered motion.div so consumers can
 * style open vs closed states via CSS without subscribing to the context.
 */
export function DropdownSubmenuContent({
  children,
  className = "popover-styled p-1 min-w-44",
  side = "right",
  sideOffset = 4,
  enterDuration = DEFAULT_SUBMENU_ENTER_DURATION,
  exitDuration = DEFAULT_SUBMENU_EXIT_DURATION,
}: DropdownSubmenuContentProps): React.JSX.Element | null {
  const submenu = useSubmenuContext();
  const root = useDropdownContext();
  const prefersReducedMotion = useReducedMotion() === true;
  const reduceMotion = root.respectReducedMotion && prefersReducedMotion;

  // Local position state, top-left anchor, with `side` resolving to left or
  // right of the trigger after collision-flip.
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [resolvedSide, setResolvedSide] = useState<"right" | "left">(side);
  const contentRef = useRef<HTMLDivElement>(null);

  // Compute portal position when the submenu opens. Layout effect keeps the
  // first paint correct (no flash at top:0/left:0).
  useEffect(() => {
    if (!submenu.isOpen) return;
    const trigger = submenu.triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const contentEl = contentRef.current;
    const contentWidth = contentEl?.offsetWidth ?? 200;
    const contentHeight = contentEl?.offsetHeight ?? 200;

    // Decide side. Default 'right' opens to the right of the trigger; flip
    // to 'left' if the right side would overflow the viewport.
    let nextSide: "right" | "left" = side;
    if (side === "right" && rect.right + sideOffset + contentWidth > window.innerWidth - VIEWPORT_INSET) {
      if (rect.left - sideOffset - contentWidth >= VIEWPORT_INSET) {
        nextSide = "left";
      }
    } else if (side === "left" && rect.left - sideOffset - contentWidth < VIEWPORT_INSET) {
      if (rect.right + sideOffset + contentWidth <= window.innerWidth - VIEWPORT_INSET) {
        nextSide = "right";
      }
    }
    setResolvedSide(nextSide);

    // Vertical: align the panel's top to the trigger's top by default;
    // shift up if it would overflow the viewport bottom.
    let top = rect.top;
    if (top + contentHeight > window.innerHeight - VIEWPORT_INSET) {
      top = Math.max(VIEWPORT_INSET, window.innerHeight - VIEWPORT_INSET - contentHeight);
    }
    const left = nextSide === "right" ? rect.right + sideOffset : rect.left - sideOffset - contentWidth;

    setPosition({ top, left });
  }, [submenu.isOpen, submenu.triggerRef, side, sideOffset]);

  // Cancel any pending hover-close when the cursor enters the panel; restart
  // the hover-close when it leaves. This is the lightweight "you can travel
  // from trigger to panel without losing it" guarantee, Radix uses a
  // safe-triangle for diagonal travel; we accept a brief vertical/horizontal
  // glitch through corners as a trade-off for far simpler implementation.
  const handlePointerEnter = useCallback(() => submenu.cancelScheduled(), [submenu]);
  const handlePointerLeave = useCallback(() => submenu.scheduleClose(), [submenu]);
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "ArrowLeft") {
        event.preventDefault();
        event.stopPropagation();
        submenu.close();
        // Return focus to the trigger.
        submenu.triggerRef.current?.focus({ preventScroll: true });
      }
    },
    [submenu],
  );

  // Motion variants, submenu owns its own enter/exit timing (faster than
  // the root dropdown by default) so chained-submenu cursor traversal
  // doesn't visibly overlap two panels. Easing still inherits from the
  // root so the panels visually belong to the same family. Reduced-motion
  // path strips scale + filter blur + x offset.
  const variants = useMemo(() => {
    if (reduceMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: enterDuration } },
        exit: { opacity: 0, transition: { duration: exitDuration } },
      };
    }
    const xOffset = resolvedSide === "right" ? -6 : 6;
    return {
      initial: { opacity: 0, scale: 0.96, x: xOffset, filter: "blur(8px)" },
      animate: {
        opacity: 1,
        scale: 1,
        x: 0,
        filter: "blur(0px)",
        boxShadow: ELEVATED_SHADOW,
        transition: {
          duration: enterDuration,
          ease: root.enterEase as [number, number, number, number],
        },
      },
      exit: {
        opacity: 0,
        scale: 0.96,
        x: xOffset,
        filter: "blur(8px)",
        transition: {
          duration: exitDuration,
          ease: root.exitEase as [number, number, number, number],
        },
      },
    };
  }, [reduceMotion, resolvedSide, enterDuration, exitDuration, root.enterEase, root.exitEase]);

  if (typeof document === "undefined") return null;

  // Always portal to body, submenus inside an overflow-hidden parent menu
  // would otherwise be clipped.
  return createPortal(
    <AnimatePresence>
      {submenu.isOpen && (
        <motion.div
          ref={contentRef}
          key="dropdown-submenu-content"
          role="menu"
          className={`fixed z-50 ${className}`}
          style={{
            top: position.top,
            left: position.left,
            transformOrigin: resolvedSide === "right" ? "left top" : "right top",
          }}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          data-state={submenu.isOpen ? "open" : "closed"}
          data-side={resolvedSide}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onKeyDown={handleKeyDown}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
