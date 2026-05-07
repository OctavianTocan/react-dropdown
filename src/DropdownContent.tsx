/**
 * @file DropdownContent.tsx
 * @brief Pure dropdown container component for composition
 */

"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useDropdownContext } from "./DropdownContext";
import { ELEVATED_SHADOW } from "./design-tokens";
import type { DropdownContentProps } from "./types";

/**
 * Inset (px) from the viewport edge that the content tries to keep when
 * collision-flipping. Without it, a flipped panel can sit flush against the
 * viewport boundary which reads as "broken layout" rather than "deliberate".
 */
const VIEWPORT_INSET = 8;

/**
 * @brief Pure dropdown container for composing dropdown contents
 *
 * Drives entry/exit motion directly off the context's `isOpen` state via
 * `AnimatePresence` — no internal `shouldRender` double-buffering — so consumer
 * `onOpenChange` callbacks fire on the same tick as the visible motion starts.
 *
 * Behavior summary (Radix-equivalent surface):
 * - `enterDuration` / `exitDuration` drive their respective motions on
 *   independent timelines via per-variant transitions.
 * - `enterEase` / `exitEase` (set on `DropdownRoot`) tune the per-direction
 *   easing curves; both default to a gentle ease-out-expo.
 * - `respectReducedMotion` (default `true`) honors the user's OS-level
 *   `prefers-reduced-motion` setting by collapsing scale/y motion to an
 *   opacity-only fade.
 * - `collisionDetection` (default `true`) flips an explicit `top` or `bottom`
 *   placement to the opposite side when the requested side would overflow the
 *   viewport. The flip is decided once per open via a layout-effect measurement.
 * - `anchorRef` (set on `DropdownRoot`) overrides the positioning anchor when
 *   it should differ from the click target (`triggerRef`).
 * - `onOpenAutoFocus` / `onCloseAutoFocus` lifecycle callbacks fire just
 *   before the default focus behavior runs; calling `event.preventDefault()`
 *   opts out and lets the consumer route focus.
 *
 * @param props Container configuration
 * @returns JSX element for dropdown container, or `null` while closed
 */
export function DropdownContent({
  children,
  // Default provides zero-config visual styling; pass a custom className
  // to match your design system's surface tokens (e.g. bg-popover border-border).
  className = "bg-white border border-gray-200 rounded-lg",
  disableAnimation = false,
  portal = false,
  portalContainer,
  backdrop = false,
  backdropClassName = "",
  "data-testid": testId = "dropdown-content",
}: DropdownContentProps) {
  const {
    isOpen,
    computedPlacement,
    triggerRef,
    anchorRef,
    usePortal: contextUsePortal,
    offset,
    align,
    alignOffset,
    enterDuration,
    exitDuration,
    enterEase,
    exitEase,
    respectReducedMotion,
    collisionDetection,
    onOpenAutoFocus,
    onCloseAutoFocus,
    closeDropdown,
  } = useDropdownContext();

  // Support both prop-level and context-level portal settings
  const shouldUsePortal = portal || contextUsePortal;

  /**
   * Portal position uses one vertical anchor and one horizontal anchor. The
   * unused side stays `null` so we can drive `style` with a discriminated
   * pin without conflicting `left`/`right` values.
   */
  const [portalPosition, setPortalPosition] = useState<{
    top: number | null;
    bottom: number | null;
    left: number | null;
    right: number | null;
  }>({ top: 0, bottom: null, left: null, right: 0 });
  // Final placement after collision-flip; falls back to the root's computed
  // placement when collision detection is disabled or the viewport has room.
  const [activePlacement, setActivePlacement] = useState<"top" | "bottom">(computedPlacement);

  // Reset activePlacement whenever the root's placement intent changes (e.g.
  // window resized between opens) so the next open re-decides cleanly.
  useEffect(() => {
    setActivePlacement(computedPlacement);
  }, [computedPlacement]);

  // Ref to the rendered motion.div so we can measure its height for collision
  // detection. Motion forwards refs through `motion.div`.
  const contentRef = useRef<HTMLDivElement>(null);

  // Honor the OS reduced-motion preference. Returns `null` during SSR; default
  // to false so the first paint matches a non-reduced client.
  const prefersReducedMotion = useReducedMotion() === true;
  const reduceMotion = respectReducedMotion && prefersReducedMotion;

  // Resolve portal container
  const resolvedPortalContainer = useMemo(() => {
    if (typeof document === "undefined") return null;
    return portalContainer || document.body;
  }, [portalContainer]);

  // Compute portal position + collision-flipped placement BEFORE paint to
  // avoid a one-frame flash at top:0 / right:0 when the dropdown first mounts.
  useLayoutEffect(() => {
    if (!isOpen) return;

    const anchor = anchorRef?.current ?? triggerRef?.current;
    if (!anchor) return;
    const triggerRect = anchor.getBoundingClientRect();

    // Use the rendered content's measured size when available so we can decide
    // whether the requested placement actually fits. On the very first frame
    // contentRef may be null because Motion mounts the child after this effect
    // resolves; we fall back to a conservative estimate (200 px) so the flip
    // logic still fires for tiny menus, then re-measure on the second frame
    // via the ResizeObserver below.
    const contentEl = contentRef.current;
    const contentHeight = contentEl?.offsetHeight ?? 200;

    let nextPlacement: "top" | "bottom" = computedPlacement;
    if (collisionDetection) {
      const spaceBelow = window.innerHeight - triggerRect.bottom - offset - VIEWPORT_INSET;
      const spaceAbove = triggerRect.top - offset - VIEWPORT_INSET;
      if (computedPlacement === "bottom" && contentHeight > spaceBelow && contentHeight <= spaceAbove) {
        nextPlacement = "top";
      } else if (
        computedPlacement === "top" &&
        contentHeight > spaceAbove &&
        contentHeight <= spaceBelow
      ) {
        nextPlacement = "bottom";
      }
    }
    setActivePlacement(nextPlacement);

    if (shouldUsePortal) {
      // Vertical anchor: place top edge of content `offset` px below the
      // trigger when bottom-placed; place bottom edge `offset` px above when
      // top-placed. The opposite side stays `null` so the inline style
      // doesn't conflict.
      const verticalAnchor =
        nextPlacement === "top"
          ? { top: null, bottom: window.innerHeight - (triggerRect.top - offset) }
          : { top: triggerRect.bottom + offset, bottom: null };

      // Horizontal anchor depends on `align`. 'end' is the historical default
      // (right edge of content to right edge of trigger). 'start' pins the
      // left edge. 'center' pins the left edge to (trigger center − content
      // half-width) so the content visually centers; needs `contentEl` to be
      // mounted for the measurement.
      let horizontalAnchor: { left: number | null; right: number | null };
      if (align === "start") {
        horizontalAnchor = { left: triggerRect.left + alignOffset, right: null };
      } else if (align === "center") {
        const contentWidth = contentEl?.offsetWidth ?? 0;
        const centerX = triggerRect.left + triggerRect.width / 2;
        horizontalAnchor = { left: centerX - contentWidth / 2 + alignOffset, right: null };
      } else {
        // 'end' (default)
        horizontalAnchor = {
          left: null,
          right: window.innerWidth - triggerRect.right - alignOffset,
        };
      }

      setPortalPosition({ ...verticalAnchor, ...horizontalAnchor });
    }
  }, [
    isOpen,
    shouldUsePortal,
    triggerRef,
    anchorRef,
    offset,
    align,
    alignOffset,
    computedPlacement,
    collisionDetection,
  ]);

  // Re-measure content when it changes size while open (e.g. async data load
  // expanding the menu) so collision flips stay accurate.
  useEffect(() => {
    if (!isOpen || !collisionDetection || typeof ResizeObserver === "undefined") return;
    const contentEl = contentRef.current;
    if (!contentEl) return;
    const observer = new ResizeObserver(() => {
      const anchor = anchorRef?.current ?? triggerRef?.current;
      if (!anchor) return;
      const triggerRect = anchor.getBoundingClientRect();
      const contentHeight = contentEl.offsetHeight;
      const spaceBelow = window.innerHeight - triggerRect.bottom - offset - VIEWPORT_INSET;
      const spaceAbove = triggerRect.top - offset - VIEWPORT_INSET;
      setActivePlacement((current) => {
        if (computedPlacement === "bottom" && contentHeight > spaceBelow && contentHeight <= spaceAbove) {
          return "top";
        }
        if (computedPlacement === "top" && contentHeight > spaceAbove && contentHeight <= spaceBelow) {
          return "bottom";
        }
        // No flip needed → revert to the root's intent.
        return computedPlacement;
      });
    });
    observer.observe(contentEl);
    return () => observer.disconnect();
  }, [isOpen, collisionDetection, anchorRef, triggerRef, offset, computedPlacement]);

  /**
   * Re-evaluate portal position on window resize and ancestor scroll while
   * the dropdown is open. Throttled via `requestAnimationFrame` so a noisy
   * scroll event doesn't trigger a layout-thrash storm. Runs only when the
   * portal is in use — non-portaled dropdowns inherit their position from
   * the layout flow and don't need repositioning.
   */
  useEffect(() => {
    if (!isOpen || !shouldUsePortal) return;

    let rafHandle: number | null = null;
    const reposition = (): void => {
      if (rafHandle !== null) return;
      rafHandle = requestAnimationFrame(() => {
        rafHandle = null;
        const anchor = anchorRef?.current ?? triggerRef?.current;
        if (!anchor) return;
        const triggerRect = anchor.getBoundingClientRect();
        const contentEl = contentRef.current;

        // Recompute vertical anchor (active placement may have flipped via
        // the ResizeObserver above).
        const verticalAnchor =
          activePlacement === "top"
            ? { top: null, bottom: window.innerHeight - (triggerRect.top - offset) }
            : { top: triggerRect.bottom + offset, bottom: null };

        let horizontalAnchor: { left: number | null; right: number | null };
        if (align === "start") {
          horizontalAnchor = { left: triggerRect.left + alignOffset, right: null };
        } else if (align === "center") {
          const contentWidth = contentEl?.offsetWidth ?? 0;
          const centerX = triggerRect.left + triggerRect.width / 2;
          horizontalAnchor = { left: centerX - contentWidth / 2 + alignOffset, right: null };
        } else {
          horizontalAnchor = {
            left: null,
            right: window.innerWidth - triggerRect.right - alignOffset,
          };
        }

        setPortalPosition({ ...verticalAnchor, ...horizontalAnchor });
      });
    };

    window.addEventListener("resize", reposition, { passive: true });
    // Capture phase so we catch scrolls on any ancestor, including the
    // document scrolling root.
    window.addEventListener("scroll", reposition, { capture: true, passive: true });

    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, { capture: true });
      if (rafHandle !== null) cancelAnimationFrame(rafHandle);
    };
  }, [isOpen, shouldUsePortal, anchorRef, triggerRef, offset, align, alignOffset, activePlacement]);

  // Lifecycle: fire onOpenAutoFocus right after the content mounts so consumers
  // can preventDefault() before the dropdown's own focus management runs.
  // Default behavior is delegated to whatever inner component owns focus
  // (DropdownSearch focuses its input; DropdownMenu's roving-tabindex hook
  // focuses the first item).
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !wasOpenRef.current && onOpenAutoFocus) {
      let prevented = false;
      onOpenAutoFocus({ preventDefault: () => { prevented = true; } });
      // Caller-driven preventDefault is a hint to the focus owner; the actual
      // behavior is implemented by the focused child (search input, menu list,
      // etc.). We expose the flag via a data attribute so children can react.
      const el = contentRef.current;
      if (el && prevented) el.dataset.preventAutofocus = "true";
    }
    if (!isOpen && wasOpenRef.current && onCloseAutoFocus) {
      let prevented = false;
      onCloseAutoFocus({ preventDefault: () => { prevented = true; } });
      // Restore focus to the trigger unless the consumer opted out.
      if (!prevented) {
        const triggerEl = triggerRef?.current;
        if (triggerEl && typeof triggerEl.focus === "function") {
          triggerEl.focus({ preventScroll: true });
        }
      }
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, onOpenAutoFocus, onCloseAutoFocus, triggerRef]);

  const placementClass = activePlacement === "top" ? "bottom-full mb-1" : "mt-1";
  const flexDirClass = activePlacement === "top" ? "flex-col-reverse" : "flex-col";

  // Transform origin for animations based on the resolved placement so the
  // scale-in feels anchored to the trigger edge.
  const transformOrigin = activePlacement === "top" ? "bottom center" : "top center";

  // Animation variants for Motion. Per-variant `transition` lets enter/exit
  // run on independent timelines, and `reduceMotion` swaps in opacity-only
  // variants to honor the OS preference.
  const variants = useMemo(() => {
    if (reduceMotion) {
      return {
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          boxShadow: ELEVATED_SHADOW,
          transition: { duration: enterDuration },
        },
        exit: {
          opacity: 0,
          transition: { duration: exitDuration },
        },
      };
    }
    // Standard variants: opacity + scale + y + filter:blur. The filter blur
    // creates the "coming into focus" feel modern overlay systems use (Linear,
    // Vercel, Arc) — element starts blurry and out-of-place, focuses in.
    // 8px is the sweet spot: enough to read as motion, not so much the menu
    // items become unreadable mid-transition. Reduced-motion path above
    // strips this for users who don't want the effect.
    return {
      initial: {
        opacity: 0,
        scale: 0.96,
        y: activePlacement === "top" ? 6 : -6,
        filter: "blur(8px)",
      },
      animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px)",
        boxShadow: ELEVATED_SHADOW,
        transition: {
          duration: enterDuration,
          ease: enterEase as [number, number, number, number],
        },
      },
      exit: {
        opacity: 0,
        scale: 0.96,
        y: activePlacement === "top" ? 6 : -6,
        filter: "blur(8px)",
        transition: {
          duration: exitDuration,
          ease: exitEase as [number, number, number, number],
        },
      },
    };
  }, [activePlacement, enterDuration, exitDuration, enterEase, exitEase, reduceMotion]);

  // Backdrop variants — fade quickly, never longer than the content motion.
  const backdropVariants = useMemo(
    () => ({
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: { duration: enterDuration * 0.5 },
      },
      exit: {
        opacity: 0,
        transition: { duration: exitDuration * 0.5 },
      },
    }),
    [enterDuration, exitDuration],
  );

  const dropdownContent = (
    <motion.div
      key="dropdown-content"
      ref={contentRef}
      className={`${shouldUsePortal ? "fixed" : "absolute"} z-50 ${shouldUsePortal ? "" : "w-full"} ${shouldUsePortal ? "" : "min-w-[320px]!"} ${shouldUsePortal ? "" : placementClass} flex ${flexDirClass} overflow-hidden ${className}`}
      style={
        shouldUsePortal
          ? {
              // Each anchor either has a number or null. Convert null →
              // undefined so React doesn't apply `top: null` (which would
              // override the opposite anchor on some engines).
              top: portalPosition.top ?? undefined,
              bottom: portalPosition.bottom ?? undefined,
              left: portalPosition.left ?? undefined,
              right: portalPosition.right ?? undefined,
              transformOrigin,
            }
          : { transformOrigin }
      }
      initial={disableAnimation ? false : "initial"}
      animate="animate"
      exit={disableAnimation ? undefined : "exit"}
      variants={variants}
      data-testid={testId}
      data-placement={activePlacement}
    >
      {children}
    </motion.div>
  );

  const content = (
    <AnimatePresence>
      {isOpen && backdrop && (
        <motion.div
          key="dropdown-backdrop"
          className={`fixed inset-0 z-40 ${backdropClassName}`}
          onClick={closeDropdown}
          initial={disableAnimation ? false : "initial"}
          animate="animate"
          exit={disableAnimation ? undefined : "exit"}
          variants={backdropVariants}
          data-testid="dropdown-backdrop"
          aria-hidden="true"
        />
      )}
      {isOpen && dropdownContent}
    </AnimatePresence>
  );

  // Render in portal if enabled
  if (shouldUsePortal && resolvedPortalContainer) {
    return createPortal(content, resolvedPortalContainer);
  }

  return content;
}
