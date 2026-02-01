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
  placeholder,
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
  enterDuration = 0.2,
  exitDuration = 0.15,
  "data-testid": testId = "dropdown-root",
}: DropdownRootProps<T>) {
  // Support deprecated dropdownPlacement prop
  const effectivePlacement = dropdownPlacement || placement;

  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(initialSelectedItem);
  const [searchQuery, setSearchQuery] = useState("");
  const [animationState, setAnimationState] = useState<DropdownAnimationState>("idle");
  const [computedPlacement, setComputedPlacement] = useState<"top" | "bottom">(
    effectivePlacement === "auto" ? "bottom" : effectivePlacement,
  );

  // Refs for DOM manipulation
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipExitAnimationRef = useRef(false);

  // Default filter function if not provided
  const defaultFilter = useCallback(
    (items: T[], query: string) => {
      if (!query.trim()) {
        return items;
      }

      const normalizedQuery = query.toLowerCase().trim();
      return items.filter((item) => getItemDisplay(item).toLowerCase().includes(normalizedQuery));
    },
    [getItemDisplay],
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
   * @brief Opens the dropdown and focuses search input
   */
  const openDropdown = useCallback(() => {
    if (disabled) return;
    skipExitAnimationRef.current = false;
    setAnimationState("entering");
    setIsOpen(true);
    onOpenChange?.(true);

    // Reset to idle after enter animation
    const timer = setTimeout(() => {
      setAnimationState("idle");
    }, enterDuration * 1000);

    return () => clearTimeout(timer);
  }, [disabled, onOpenChange, enterDuration]);

  /**
   * @brief Synchronously focus search input after dropdown opens
   */
  useLayoutEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  /**
   * @brief Closes the dropdown and clears search with exit animation
   */
  const closeDropdown = useCallback(() => {
    if (!isOpen) return;

    if (skipExitAnimationRef.current) {
      setIsOpen(false);
      setSearchQuery("");
      setAnimationState("idle");
      onOpenChange?.(false);
      return;
    }

    setAnimationState("exiting");

    // Close after exit animation
    const timer = setTimeout(() => {
      setIsOpen(false);
      setSearchQuery("");
      setAnimationState("idle");
      onOpenChange?.(false);
    }, exitDuration * 1000);

    return () => clearTimeout(timer);
  }, [isOpen, onOpenChange, exitDuration]);

  /**
   * @brief Closes the dropdown immediately without exit animation
   */
  const closeImmediate = useCallback(() => {
    skipExitAnimationRef.current = true;
    setIsOpen(false);
    setSearchQuery("");
    setAnimationState("idle");
    onOpenChange?.(false);
  }, [onOpenChange]);

  /**
   * @brief Toggles dropdown open/closed state
   */
  const toggleDropdown = useCallback(() => {
    isOpen ? closeDropdown() : openDropdown();
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
    [onSelect, closeDropdown, closeOnSelect],
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
    ],
  );

  return (
    <DropdownProvider value={contextValue}>
      <div ref={dropdownRef} className={`relative ${className}`} data-testid={testId}>
        {children}
      </div>
    </DropdownProvider>
  );
}
