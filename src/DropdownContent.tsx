/**
 * @file DropdownContent.tsx
 * @brief Pure dropdown container component for composition
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useDropdownContext } from './DropdownContext';
import { ELEVATED_SHADOW, EXIT_ANIMATION_DURATION_MS } from './design-tokens';
import type { BaseDropdownProps } from './types';

interface DropdownContentProps extends BaseDropdownProps {
  /** Disable animations (useful for mobile or performance) */
  disableAnimation?: boolean;
}

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
  className = '',
  disableAnimation = false,
  'data-testid': testId = 'dropdown-content',
}: DropdownContentProps) {
  const { isOpen, dropdownPlacement, triggerRef, usePortal } = useDropdownContext();
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [portalPosition, setPortalPosition] = useState({ top: 0, right: 0 });
  const prevIsOpen = useRef(isOpen);

  // Calculate position for portal mode
  useEffect(() => {
    if (usePortal && isOpen && triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPortalPosition({
        top: rect.bottom + 4, // 4px gap below trigger
        right: window.innerWidth - rect.right, // Align dropdown's right edge with trigger's right edge
      });
    }
  }, [isOpen, usePortal, triggerRef]);

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
        }, EXIT_ANIMATION_DURATION_MS);
        return () => clearTimeout(timer);
      }
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, disableAnimation]);

  const placementClass = dropdownPlacement === 'top' ? 'bottom-full mb-1' : 'mt-1';
  const flexDirClass = dropdownPlacement === 'top' ? 'flex-col-reverse' : 'flex-col';

  // Transform origin for animations based on placement
  const transformOrigin = dropdownPlacement === 'top' ? 'bottom center' : 'top center';

  // Animation variants for Framer Motion
  const variants = {
    initial: {
      opacity: 0,
      scale: 0.95,
      y: dropdownPlacement === 'top' ? 8 : -8,
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
      y: dropdownPlacement === 'top' ? 8 : -8,
    },
  };

  const content = (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          className={`${usePortal ? 'fixed' : 'absolute'} z-50 ${usePortal ? '' : 'w-full'} ${usePortal ? '' : 'min-w-[320px]!'} ${usePortal ? '' : placementClass} bg-white border border-gray-200 rounded-lg flex ${flexDirClass} overflow-hidden ${className}`}
          style={
            usePortal ? { top: portalPosition.top, right: portalPosition.right, transformOrigin } : { transformOrigin }
          }
          initial={disableAnimation ? false : 'initial'}
          animate="animate"
          exit={disableAnimation ? undefined : 'exit'}
          variants={variants}
          transition={{
            duration: 0.15,
            ease: [0.16, 1, 0.3, 1], // Custom ease for smooth feel
          }}
          data-testid={testId}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render in portal if usePortal is true
  if (usePortal && typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }

  return content;
}
