/**
 * @file DropdownRoot.tsx
 * @brief Main provider component for dropdown functionality
 */

"use client";

import { useState, useCallback, useRef, useMemo, useLayoutEffect, useEffect } from "react";
import { DropdownProvider, useClickOutside } from "./DropdownContext";
import type { DropdownRootProps, DropdownContextValue, DropdownAnimationState } from "./types";

/**
 * @brief Computes dropdown placement based on trigger position in viewport
 * @param triggerRect The bounding rect of the trigger element
 * @param placement The requested placement ('auto', 'top', or 'bottom')
 * @returns Computed placement ('top' or 'bottom')
 */
function computePlacement(triggerRect: DOMRect | null, placement: "auto" | "top" | "bottom"): "top" | "bottom" {
  if (placement !== "auto") {
    return placement;
  }

  if (!triggerRect) {
    return "bottom";
  }

  // Check if trigger is in the lower half of the viewport
  const viewportHeight = window.innerHeight;
  const triggerCenter = triggerRect.top + triggerRect.height / 2;
  const isInLowerHalf = triggerCenter > viewportHeight / 2;

  return isInLowerHalf ? "top" : "bottom";
}

/**
 * @brief Drives the {@link DropdownContextValue.animationState} hint without
 * blocking state propagation
 *
 * The hint flips to `"entering"`/`"exiting"` when `isOpen` changes and resolves
 * to `"idle"` once the corresponding motion duration has elapsed. Consumers can
 * subscribe via `useDropdownContext()` for transition-tied side effects, but
 * `setIsOpen` and `onOpenChange` must NOT be gated on it — earlier versions of
 * this component scheduled the open/close itself behind a `setTimeout` keyed
 * to `exitDuration`, which made the dropdown sit visually open for ~150 ms
 * before any pixel changed and forced consumer guards (e.g. `useTooltipDropdown`)
 * to compensate. The animation timing now lives in the motion variants only.
 *
 * @param isOpen Current open state of the dropdown
 * @param enterDuration Duration in seconds for the entering→idle transition
 * @param exitDuration Duration in seconds for the exiting→idle transition
 * @returns Current animation state
 */
function useAnimationStateTracker(
  isOpen: boolean,
  enterDuration: number,
  exitDuration: number,
): DropdownAnimationState {
  const [animationState, setAnimationState] = useState<DropdownAnimationState>("idle");
  // We track the previous open state so that a remount with `isOpen=false`
  // doesn't briefly publish `"exiting"` when the dropdown was never open.
  const prevIsOpenRef = useRef(isOpen);

  useEffect(() => {
    if (isOpen === prevIsOpenRef.current) return;
    prevIsOpenRef.current = isOpen;

    setAnimationState(isOpen ? "entering" : "exiting");
    const duration = (isOpen ? enterDuration : exitDuration) * 1000;
    const timer = setTimeout(() => setAnimationState("idle"), duration);
    return () => clearTimeout(timer);
  }, [isOpen, enterDuration, exitDuration]);

  return animationState;
}

/**
 * @brief Main provider component that manages dropdown state
 *
 * This component provides all the state management and context for dropdown functionality.
 * It handles open/close state, selection, search functionality, and provides
 * all necessary callbacks to child components through context.
 *
 * @param props Dropdown configuration and callbacks
 * @returns JSX element providing context to children
 */
export function DropdownRoot<T>({
  children,
  items,
  selectedItem: initialSelectedItem = null,
  onSelect,
  getItemKey,
  getItemDisplay,
  filterItems,
  disabled = false,
  placeholder: _placeholder,
  className = "",
  placement = "bottom",
  dropdownPlacement,
  offset = 8,
  getItemDescription,
  getItemIcon,
  getItemSection,
  getItemSeparator,
  getItemDisabled,
  getItemClassName,
  closeOnSelect = true,
  onOpenChange,
  triggerRef,
  usePortal = false,
  align = "end",
  alignOffset = 0,
  // Linear-snappy defaults: 140 ms in, 100 ms out, ease-out-expo entering,
  // ease-in-quint exiting. Open is "reveal slowly enough to read"; close is
  // "get out of my way." See DESIGN.md → Motion → Open/close timing.
  enterDuration = 0.14,
  exitDuration = 0.1,
  enterEase = [0.16, 1, 0.3, 1] as const,
  exitEase = [0.7, 0, 0.84, 0] as const,
  anchorRef,
  onOpenAutoFocus,
  onCloseAutoFocus,
  respectReducedMotion = true,
  collisionDetection = true,
  "data-testid": testId = "dropdown-root",
}: DropdownRootProps<T>) {
  // Exit easing now defaults to ease-in-quint independently of enter easing,
  // but if consumer passes only `enterEase`, mirror it on exit (legacy behavior).
  const resolvedExitEase = exitEase;
  // Support deprecated dropdownPlacement prop
  const effectivePlacement = dropdownPlacement || placement;

  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(initialSelectedItem);
  const [searchQuery, setSearchQuery] = useState("");
  const [computedPlacement, setComputedPlacement] = useState<"top" | "bottom">(
    effectivePlacement === "auto" ? "bottom" : effectivePlacement
  );

  // Refs for DOM manipulation
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Default filter function if not provided
  const defaultFilter = useCallback(
    (items: readonly T[], query: string): T[] => {
      if (!query.trim()) {
        return [...items];
      }

      const normalizedQuery = query.toLowerCase().trim();
      return items.filter((item) => getItemDisplay(item).toLowerCase().includes(normalizedQuery));
    },
    [getItemDisplay]
  );

  // Memoized filter function
  const filterFunction = filterItems || defaultFilter;

  // Memoized filtered items
  const filteredItems = useMemo(() => {
    return filterFunction(items, searchQuery);
  }, [items, searchQuery, filterFunction]);

  // Compute placement when opening
  useEffect(() => {
    if (isOpen && effectivePlacement === "auto") {
      const triggerElement = triggerRef?.current || dropdownRef.current?.querySelector("button");
      const rect = triggerElement?.getBoundingClientRect() || null;
      setComputedPlacement(computePlacement(rect, effectivePlacement));
    } else if (effectivePlacement !== "auto") {
      setComputedPlacement(effectivePlacement);
    }
  }, [isOpen, effectivePlacement, triggerRef]);

  /**
   * @brief Opens the dropdown and notifies the consumer synchronously
   *
   * Fires `setIsOpen(true)` and `onOpenChange(true)` in the same tick as the
   * caller's gesture. The visible enter animation is owned entirely by
   * `DropdownContent`'s motion variants (keyed off `isOpen`), so consumers can
   * key sibling UI (e.g. tooltip suppression) on `onOpenChange` without
   * accumulating timing skew.
   */
  const openDropdown = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    onOpenChange?.(true);
  }, [disabled, onOpenChange]);

  /**
   * @brief Synchronously focus search input after dropdown opens
   */
  useLayoutEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  /**
   * @brief Closes the dropdown and clears search query
   *
   * Flips `isOpen` to `false` and fires `onOpenChange(false)` synchronously;
   * `DropdownContent` then runs its exit motion via `AnimatePresence` and
   * unmounts when that motion completes. Earlier versions deferred the state
   * change behind `setTimeout(exitDuration)`, leaving the dropdown visibly
   * frozen for ~150 ms after the user clicked.
   */
  const closeDropdown = useCallback(() => {
    if (!isOpen) return;
    setIsOpen(false);
    setSearchQuery("");
    onOpenChange?.(false);
  }, [isOpen, onOpenChange]);

  /**
   * @brief Closes the dropdown — alias of {@link closeDropdown}
   *
   * Retained for backward compatibility with consumers that referenced
   * `closeImmediate`. The previous "skip exit animation" behavior is no
   * longer meaningful: state changes propagate immediately and the visible
   * exit motion is owned by `DropdownContent`. Pass `disableAnimation` to
   * `DropdownContent` (or set `exitDuration={0}`) when you genuinely need
   * an instant teardown.
   */
  const closeImmediate = closeDropdown;

  /**
   * @brief Toggles dropdown open/closed state
   */
  const toggleDropdown = useCallback(() => {
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }, [isOpen, openDropdown, closeDropdown]);

  /**
   * @brief Handles item selection
   * @param item Selected item
   */
  const handleSelect = useCallback(
    (item: T) => {
      setSelectedItem(item);
      onSelect(item);
      if (closeOnSelect) {
        closeDropdown();
      }
    },
    [onSelect, closeDropdown, closeOnSelect]
  );

  /**
   * @brief Handles search query changes
   * @param query New search query
   */
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Setup click outside detection
  useClickOutside(dropdownRef as React.RefObject<HTMLElement>, closeDropdown, isOpen);

  // Animation state hint — derived, never blocks setIsOpen/onOpenChange.
  const animationState = useAnimationStateTracker(isOpen, enterDuration, exitDuration);

  // Context value to provide to children
  const contextValue: DropdownContextValue<T> = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      selectedItem,
      setSelectedItem,
      searchQuery,
      setSearchQuery: handleSearchChange,
      items,
      filteredItems,
      getItemKey,
      getItemDisplay,
      filterItems: filterFunction,
      onSelect: handleSelect,
      disabled,
      closeOnSelect,
      closeDropdown,
      closeImmediate,
      toggleDropdown,
      animationState,
      computedPlacement,
      dropdownPlacement: computedPlacement,
      offset,
      align,
      alignOffset,
      getItemDescription,
      getItemIcon,
      getItemSection,
      getItemSeparator,
      getItemDisabled,
      getItemClassName,
      triggerRef,
      usePortal,
      enterDuration,
      exitDuration,
      enterEase,
      exitEase: resolvedExitEase,
      anchorRef,
      onOpenAutoFocus,
      onCloseAutoFocus,
      respectReducedMotion,
      collisionDetection,
    }),
    [
      isOpen,
      setIsOpen,
      selectedItem,
      setSelectedItem,
      searchQuery,
      handleSearchChange,
      items,
      filteredItems,
      getItemKey,
      getItemDisplay,
      filterFunction,
      handleSelect,
      disabled,
      closeOnSelect,
      closeDropdown,
      closeImmediate,
      toggleDropdown,
      animationState,
      computedPlacement,
      offset,
      align,
      alignOffset,
      getItemDescription,
      getItemIcon,
      getItemSection,
      getItemSeparator,
      getItemDisabled,
      getItemClassName,
      triggerRef,
      usePortal,
      enterDuration,
      exitDuration,
      enterEase,
      resolvedExitEase,
      anchorRef,
      onOpenAutoFocus,
      onCloseAutoFocus,
      respectReducedMotion,
      collisionDetection,
    ]
  );

  return (
    <DropdownProvider value={contextValue}>
      <div ref={dropdownRef} className={`relative ${className}`} data-testid={testId}>
        {children}
      </div>
    </DropdownProvider>
  );
}
