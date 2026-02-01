/**
 * @file DropdownContent.tsx
 * @brief Pure dropdown container component for composition
 */

"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useDropdownContext } from "./DropdownContext";
import { ELEVATED_SHADOW } from "./design-tokens";
import type { DropdownContentProps } from "./types";

/**
 * @brief Pure dropdown container for composing dropdown contents
 *
 * This component provides the dropdown container that appears when
 * the dropdown is open. It accepts any children for maximum flexibility.
 * Use this for custom compositions, or use pre-made dropdowns like
 * DropdownSearchable or DropdownSimple.
 *
 * @param props Container configuration
 * @returns JSX element for dropdown container or null if closed
 */
export function DropdownContent({
  children,
  className = "",
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
    usePortal: contextUsePortal,
    offset,
    enterDuration,
    exitDuration,
    closeDropdown,
  } = useDropdownContext();

  // Support both prop-level and context-level portal settings
  const shouldUsePortal = portal || contextUsePortal;

  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [portalPosition, setPortalPosition] = useState({ top: 0, right: 0 });
  const prevIsOpen = useRef(isOpen);

  // Resolve portal container
  const resolvedPortalContainer = useMemo(() => {
    if (typeof document === "undefined") return null;
    return portalContainer || document.body;
  }, [portalContainer]);

  // Calculate position for portal mode
  useEffect(() => {
    if (shouldUsePortal && isOpen && triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      if (computedPlacement === "top") {
        setPortalPosition({
          top: rect.top - offset, // Position above trigger
          right: window.innerWidth - rect.right,
        });
      } else {
        setPortalPosition({
          top: rect.bottom + offset, // Position below trigger with offset
          right: window.innerWidth - rect.right,
        });
      }
    }
  }, [isOpen, shouldUsePortal, triggerRef, offset, computedPlacement]);

  // Convert exitDuration to ms for timeout
  const exitDurationMs = exitDuration * 1000;

  useEffect(() => {
    if (isOpen) {
      // Opening: render immediately
      setShouldRender(true);
      setIsClosing(false);
    } else if (prevIsOpen.current && !isOpen) {
      // Closing: start exit animation
      if (disableAnimation) {
        setShouldRender(false);
      } else {
        setIsClosing(true);
        const timer = setTimeout(() => {
          setShouldRender(false);
          setIsClosing(false);
        }, exitDurationMs);
        return () => clearTimeout(timer);
      }
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, disableAnimation, exitDurationMs]);

  const placementClass = computedPlacement === "top" ? "bottom-full mb-1" : "mt-1";
  const flexDirClass = computedPlacement === "top" ? "flex-col-reverse" : "flex-col";

  // Transform origin for animations based on placement
  const transformOrigin = computedPlacement === "top" ? "bottom center" : "top center";

  // Animation variants for Framer Motion
  const variants = {
    initial: {
      opacity: 0,
      scale: 0.95,
      y: computedPlacement === "top" ? 8 : -8,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      boxShadow: ELEVATED_SHADOW,
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: computedPlacement === "top" ? 8 : -8,
    },
  };

  // Backdrop variants
  const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const dropdownContent = (
    <motion.div
      className={`${shouldUsePortal ? "fixed" : "absolute"} z-50 ${shouldUsePortal ? "" : "w-full"} ${shouldUsePortal ? "" : "min-w-[320px]!"} ${shouldUsePortal ? "" : placementClass} bg-white border border-gray-200 rounded-lg flex ${flexDirClass} overflow-hidden ${className}`}
      style={
        shouldUsePortal
          ? {
              top: computedPlacement === "top" ? undefined : portalPosition.top,
              bottom: computedPlacement === "top" ? window.innerHeight - portalPosition.top : undefined,
              right: portalPosition.right,
              transformOrigin,
            }
          : { transformOrigin }
      }
      initial={disableAnimation ? false : "initial"}
      animate="animate"
      exit={disableAnimation ? undefined : "exit"}
      variants={variants}
      transition={{
        duration: enterDuration,
        ease: [0.16, 1, 0.3, 1], // Custom ease for smooth feel
      }}
      data-testid={testId}
    >
      {children}
    </motion.div>
  );

  const content = (
    <AnimatePresence>
      {shouldRender && (
        <>
          {backdrop && (
            <motion.div
              className={`fixed inset-0 z-40 ${backdropClassName}`}
              onClick={closeDropdown}
              initial={disableAnimation ? false : "initial"}
              animate="animate"
              exit={disableAnimation ? undefined : "exit"}
              variants={backdropVariants}
              transition={{ duration: enterDuration * 0.5 }}
              data-testid="dropdown-backdrop"
              aria-hidden="true"
            />
          )}
          {dropdownContent}
        </>
      )}
    </AnimatePresence>
  );

  // Render in portal if enabled
  if (shouldUsePortal && resolvedPortalContainer) {
    return createPortal(content, resolvedPortalContainer);
  }

  return content;
}
