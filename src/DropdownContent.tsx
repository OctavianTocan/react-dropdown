/**
 * @file DropdownContent.tsx
 * @brief Pure dropdown container component for composition
 */

"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useReducer } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, domAnimation, LazyMotion, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { useDropdownContext } from "./DropdownContext";
import { ELEVATED_SHADOW } from "./design-tokens";
import { DropdownSubmenuGroupProvider } from "./DropdownSubmenu";
import type { DropdownContentProps } from "./types";

/**
 * Inset (px) from the viewport edge that the content tries to keep when
 * collision-flipping. Without it, a flipped panel can sit flush against the
 * viewport boundary which reads as "broken layout" rather than "deliberate".
 */
const VIEWPORT_INSET = 8;

type PortalPosition = {
  top: number | null;
  bottom: number | null;
  left: number | null;
  right: number | null;
};

interface DropdownContentPositionOptions {
  activePlacementSeed: "top" | "bottom";
  align: "start" | "center" | "end";
  alignOffset: number;
  anchorRef?: React.RefObject<HTMLElement | null>;
  collisionDetection: boolean;
  isOpen: boolean;
  offset: number;
  shouldUsePortal: boolean;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

function resolveHorizontalAnchor({
  align,
  alignOffset,
  contentWidth,
  triggerRect,
}: {
  align: "start" | "center" | "end";
  alignOffset: number;
  contentWidth: number;
  triggerRect: DOMRect;
}): Pick<PortalPosition, "left" | "right"> {
  if (align === "start") {
    return { left: triggerRect.left + alignOffset, right: null };
  }
  if (align === "center") {
    const centerX = triggerRect.left + triggerRect.width / 2;
    return { left: centerX - contentWidth / 2 + alignOffset, right: null };
  }
  return {
    left: null,
    right: window.innerWidth - triggerRect.right - alignOffset,
  };
}

function resolveVerticalAnchor(
  placement: "top" | "bottom",
  triggerRect: DOMRect,
  offset: number
): Pick<PortalPosition, "top" | "bottom"> {
  return placement === "top"
    ? { top: null, bottom: window.innerHeight - (triggerRect.top - offset) }
    : { top: triggerRect.bottom + offset, bottom: null };
}

function resolveCollisionPlacement({
  collisionDetection,
  computedPlacement,
  contentHeight,
  offset,
  triggerRect,
}: {
  collisionDetection: boolean;
  computedPlacement: "top" | "bottom";
  contentHeight: number;
  offset: number;
  triggerRect: DOMRect;
}): "top" | "bottom" {
  if (!collisionDetection) return computedPlacement;
  const spaceBelow = window.innerHeight - triggerRect.bottom - offset - VIEWPORT_INSET;
  const spaceAbove = triggerRect.top - offset - VIEWPORT_INSET;
  if (computedPlacement === "bottom" && contentHeight > spaceBelow && contentHeight <= spaceAbove) {
    return "top";
  }
  if (computedPlacement === "top" && contentHeight > spaceAbove && contentHeight <= spaceBelow) {
    return "bottom";
  }
  return computedPlacement;
}

function useDropdownContentPosition({
  activePlacementSeed,
  align,
  alignOffset,
  anchorRef,
  collisionDetection,
  isOpen,
  offset,
  shouldUsePortal,
  triggerRef,
}: DropdownContentPositionOptions): {
  activePlacement: "top" | "bottom";
  contentRef: React.RefObject<HTMLDivElement | null>;
  portalPosition: PortalPosition;
} {
  const [portalPosition, setPortalPosition] = useState<PortalPosition>({
    top: 0,
    bottom: null,
    left: null,
    right: 0,
  });
  const [activePlacement, dispatchActivePlacement] = useReducer(
    (
      current: "top" | "bottom",
      next: "top" | "bottom" | ((current: "top" | "bottom") => "top" | "bottom")
    ): "top" | "bottom" => (typeof next === "function" ? next(current) : next),
    activePlacementSeed
  );
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatchActivePlacement(activePlacementSeed);
  }, [activePlacementSeed]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const anchor = anchorRef?.current ?? triggerRef?.current;
    if (!anchor) return;
    const triggerRect = anchor.getBoundingClientRect();
    const contentEl = contentRef.current;
    const nextPlacement = resolveCollisionPlacement({
      collisionDetection,
      computedPlacement: activePlacementSeed,
      contentHeight: contentEl?.offsetHeight ?? 200,
      offset,
      triggerRect,
    });
    dispatchActivePlacement(nextPlacement);
    if (!shouldUsePortal) return;
    setPortalPosition({
      ...resolveVerticalAnchor(nextPlacement, triggerRect, offset),
      ...resolveHorizontalAnchor({
        align,
        alignOffset,
        contentWidth: contentEl?.offsetWidth ?? 0,
        triggerRect,
      }),
    });
  }, [
    isOpen,
    shouldUsePortal,
    triggerRef,
    anchorRef,
    offset,
    align,
    alignOffset,
    activePlacementSeed,
    collisionDetection,
  ]);

  useEffect(() => {
    if (!isOpen || !collisionDetection || typeof ResizeObserver === "undefined") return;
    const contentEl = contentRef.current;
    if (!contentEl) return;
    const observer = new ResizeObserver(() => {
      const anchor = anchorRef?.current ?? triggerRef?.current;
      if (!anchor) return;
      const triggerRect = anchor.getBoundingClientRect();
      dispatchActivePlacement(
        resolveCollisionPlacement({
          collisionDetection,
          computedPlacement: activePlacementSeed,
          contentHeight: contentEl.offsetHeight,
          offset,
          triggerRect,
        })
      );
    });
    observer.observe(contentEl);
    return () => observer.disconnect();
  }, [isOpen, collisionDetection, anchorRef, triggerRef, offset, activePlacementSeed]);

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
        setPortalPosition({
          ...resolveVerticalAnchor(activePlacement, triggerRect, offset),
          ...resolveHorizontalAnchor({
            align,
            alignOffset,
            contentWidth: contentEl?.offsetWidth ?? 0,
            triggerRect,
          }),
        });
      });
    };
    window.addEventListener("resize", reposition, { passive: true });
    window.addEventListener("scroll", reposition, { capture: true, passive: true });
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, { capture: true });
      if (rafHandle !== null) cancelAnimationFrame(rafHandle);
    };
  }, [isOpen, shouldUsePortal, anchorRef, triggerRef, offset, align, alignOffset, activePlacement]);

  return { activePlacement, contentRef, portalPosition };
}

/**
 * @brief Pure dropdown container for composing dropdown contents
 *
 * Drives entry/exit motion directly off the context's `isOpen` state via
 * `AnimatePresence`, no internal `shouldRender` double-buffering, so consumer
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
  className = "bg-white border border-zinc-200 rounded-lg",
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
  const shouldUsePortal = portal || contextUsePortal || false;

  const { activePlacement, contentRef, portalPosition } = useDropdownContentPosition({
    activePlacementSeed: computedPlacement,
    align,
    alignOffset,
    anchorRef,
    collisionDetection,
    isOpen,
    offset,
    shouldUsePortal,
    triggerRef,
  });

  // Honor the OS reduced-motion preference. Returns `null` during SSR; default
  // to false so the first paint matches a non-reduced client.
  const prefersReducedMotion = useReducedMotion() === true;
  const reduceMotion = respectReducedMotion && prefersReducedMotion;

  // Resolve portal container
  const resolvedPortalContainer = useMemo(() => {
    if (typeof document === "undefined") return null;
    return portalContainer || document.body;
  }, [portalContainer]);

  // Lifecycle: fire onOpenAutoFocus right after the content mounts so consumers
  // can preventDefault() before the dropdown's own focus management runs.
  // Default behavior is delegated to whatever inner component owns focus
  // (DropdownSearch focuses its input; DropdownMenu's roving-tabindex hook
  // focuses the first item).
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !wasOpenRef.current && onOpenAutoFocus) {
      let prevented = false;
      onOpenAutoFocus({
        preventDefault: () => {
          prevented = true;
        },
      });
      // Caller-driven preventDefault is a hint to the focus owner; the actual
      // behavior is implemented by the focused child (search input, menu list,
      // etc.). We expose the flag via a data attribute so children can react.
      const el = contentRef.current;
      if (el && prevented) el.dataset.preventAutofocus = "true";
    }
    if (!isOpen && wasOpenRef.current && onCloseAutoFocus) {
      let prevented = false;
      onCloseAutoFocus({
        preventDefault: () => {
          prevented = true;
        },
      });
      // Restore focus to the trigger unless the consumer opted out.
      if (!prevented) {
        const triggerEl = triggerRef?.current;
        if (triggerEl && typeof triggerEl.focus === "function") {
          triggerEl.focus({ preventScroll: true });
        }
      }
    }
    wasOpenRef.current = isOpen;
  }, [contentRef, isOpen, onOpenAutoFocus, onCloseAutoFocus, triggerRef]);

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
    // Vercel, Arc), element starts blurry and out-of-place, focuses in.
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

  // Backdrop variants, fade quickly, never longer than the content motion.
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
    [enterDuration, exitDuration]
  );

  const dropdownContent = (
    <m.div
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
      // Stable attribute the outside-click detector uses to recognise
      // portaled content as "inside" the dropdown. With ``usePortal``,
      // the content is rendered into ``document.body`` and is no longer
      // a descendant of the dropdown's wrapper ``<div ref={dropdownRef}>``,
      // so a plain ``dropdownRef.contains(target)`` check thinks every
      // click on an option is outside the dropdown and closes it before
      // the option's ``onClick`` can fire. ``useClickOutside`` walks the
      // event target up to the first element carrying this attribute.
      data-dropdown-portal-content="true"
    >
      {/* Wrap children in a fresh submenu group so direct-child
          DropdownSubmenus inside this panel coordinate (auto-close peers
          when one opens). Nested submenus layer their own group so they
          don't accidentally close their cousins above. See
          `DropdownSubmenu.tsx` for the rationale. */}
      <DropdownSubmenuGroupProvider>{children}</DropdownSubmenuGroupProvider>
    </m.div>
  );

  const content = (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isOpen && backdrop && (
          <m.div
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
    </LazyMotion>
  );

  // Render in portal if enabled
  if (shouldUsePortal && resolvedPortalContainer) {
    return createPortal(content, resolvedPortalContainer);
  }

  return content;
}
