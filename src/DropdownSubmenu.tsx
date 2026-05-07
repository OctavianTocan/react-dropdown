/**
 * @file DropdownSubmenu.tsx
 * @brief Flyout submenu (Radix `DropdownMenuSub` parity)
 *
 * Three-component composition that opens a portaled side panel relative to a
 * parent menu item:
 *
 * - `DropdownSubmenu` — context provider; owns the submenu's open state and
 *   anchor ref.
 * - `DropdownSubmenuTrigger` — the parent menu's item that opens the
 *   submenu. Mirrors `MenuTrigger`'s `asChild` pattern. Includes hover-open,
 *   click-toggle, ArrowRight-open keyboard shortcut.
 * - `DropdownSubmenuContent` — the portaled flyout panel. Reuses the parent
 *   `DropdownContent` motion variants for visual continuity (filter blur,
 *   scale + y motion, ease-in-quint exit) while owning its own anchor ref
 *   so collision-flipping is local to the submenu's space.
 *
 * Nested submenus work because each `DropdownSubmenu` creates its own
 * context — the chain is just nested providers. Click-outside on the root
 * closes everything; Escape inside a sub closes that sub level and returns
 * focus to the parent's trigger.
 */

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useDropdownContext } from "./DropdownContext";
import { Slot } from "./Slot";
import { ELEVATED_SHADOW } from "./design-tokens";

/** Hover-open delay (ms) before the submenu appears on pointer-enter. */
const HOVER_OPEN_DELAY_MS = 100;
/** Hover-close delay (ms) — gives the user time to drift toward the panel. */
const HOVER_CLOSE_DELAY_MS = 200;
/** Inset (px) from the viewport edge when collision-flipping side. */
const VIEWPORT_INSET = 8;

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
  const ctx = useContext(SubmenuContext);
  if (!ctx) {
    throw new Error(
      "DropdownSubmenuTrigger / DropdownSubmenuContent must be rendered inside <DropdownSubmenu>.",
    );
  }
  return ctx;
}

/**
 * @brief Submenu state container — wraps a trigger + content pair.
 *
 * Renders no DOM of its own; just provides the submenu context.
 */
export function DropdownSubmenu({ children }: { children: ReactNode }): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  // Single shared timer ref — schedule overrides cancel cleanly. Critical
  // under spam: if the user moves the cursor on/off the trigger rapidly,
  // each transition resets the pending action so the visible state matches
  // the most recent intent.
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const cancelScheduled = useCallback((): void => {
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const open = useCallback((): void => {
    cancelScheduled();
    setIsOpen(true);
  }, [cancelScheduled]);

  const close = useCallback((): void => {
    cancelScheduled();
    setIsOpen(false);
  }, [cancelScheduled]);

  const scheduleOpen = useCallback((): void => {
    cancelScheduled();
    timerRef.current = setTimeout(() => {
      setIsOpen(true);
      timerRef.current = undefined;
    }, HOVER_OPEN_DELAY_MS);
  }, [cancelScheduled]);

  const scheduleClose = useCallback((): void => {
    cancelScheduled();
    timerRef.current = setTimeout(() => {
      setIsOpen(false);
      timerRef.current = undefined;
    }, HOVER_CLOSE_DELAY_MS);
  }, [cancelScheduled]);

  // Always clear pending timers on unmount so a stale setTimeout can't
  // setState after the submenu is gone.
  useEffect(() => {
    return cancelScheduled;
  }, [cancelScheduled]);

  const value = useMemo<SubmenuContextValue>(
    () => ({ isOpen, open, close, scheduleOpen, scheduleClose, cancelScheduled, triggerRef }),
    [isOpen, open, close, scheduleOpen, scheduleClose, cancelScheduled],
  );

  return <SubmenuContext.Provider value={value}>{children}</SubmenuContext.Provider>;
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
}

/**
 * @brief Menu-item-like button that opens the parent's submenu.
 *
 * Behavior:
 * - **Click / Enter / Space**: toggle open.
 * - **ArrowRight**: open (Radix convention — submenus open right by default).
 * - **PointerEnter**: schedule open after `HOVER_OPEN_DELAY_MS`.
 * - **PointerLeave**: schedule close after `HOVER_CLOSE_DELAY_MS` — long
 *   enough for the user to drift onto the submenu panel without losing it.
 *
 * The panel itself cancels the close-schedule when the cursor enters it,
 * giving us a simple alternative to Radix's safe-triangle logic.
 */
export function DropdownSubmenuTrigger({
  asChild = false,
  children,
  className,
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

  const handlers = {
    onClick: useCallback(() => {
      if (isOpen) close();
      else open();
    }, [isOpen, open, close]),
    onPointerEnter: scheduleOpen,
    onPointerLeave: scheduleClose,
    onKeyDown: useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          open();
        }
      },
      [open],
    ),
    "aria-haspopup": "menu" as const,
    "aria-expanded": isOpen,
    "data-state": isOpen ? ("open" as const) : ("closed" as const),
  };

  if (asChild) {
    return (
      <Slot ref={setRef} {...handlers}>
        {children}
      </Slot>
    );
  }
  return (
    <button
      type="button"
      ref={setRef as React.Ref<HTMLButtonElement>}
      className={className}
      {...handlers}
    >
      {children}
    </button>
  );
}

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
}: DropdownSubmenuContentProps): React.JSX.Element | null {
  const submenu = useSubmenuContext();
  const root = useDropdownContext();
  const prefersReducedMotion = useReducedMotion() === true;
  const reduceMotion = root.respectReducedMotion && prefersReducedMotion;

  // Local position state — top-left anchor, with `side` resolving to left or
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
  // from trigger to panel without losing it" guarantee — Radix uses a
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

  // Motion variants — match the root's enter/exit timing & easing so the
  // submenu visually belongs to the same family. Reduced-motion path strips
  // scale + filter blur + x offset.
  const variants = useMemo(() => {
    if (reduceMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: root.enterDuration } },
        exit: { opacity: 0, transition: { duration: root.exitDuration } },
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
          duration: root.enterDuration,
          ease: root.enterEase as [number, number, number, number],
        },
      },
      exit: {
        opacity: 0,
        scale: 0.96,
        x: xOffset,
        filter: "blur(8px)",
        transition: {
          duration: root.exitDuration,
          ease: root.exitEase as [number, number, number, number],
        },
      },
    };
  }, [reduceMotion, resolvedSide, root.enterDuration, root.exitDuration, root.enterEase, root.exitEase]);

  if (typeof document === "undefined") return null;

  // Always portal to body — submenus inside an overflow-hidden parent menu
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
