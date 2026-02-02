/**
 * @file DropdownContext.tsx
 * @brief Context provider for dropdown state management
 */

"use client";

import { createContext, useContext, ReactNode, useRef, useState, useEffect, useCallback } from "react";
import type { DropdownContextValue } from "./types";

/**
 * @brief Dropdown context for managing state across dropdown components
 */
const DropdownContext = createContext<DropdownContextValue<unknown> | null>(null);

/**
 * @brief Hook to access dropdown context
 * @throws Error if used outside DropdownProvider
 * @returns Dropdown context value
 */
export function useDropdownContext<T>() {
  const context = useContext(DropdownContext) as DropdownContextValue<T> | null;

  if (!context) {
    throw new Error(
      `useDropdownContext must be used within <Dropdown.Root>.

Example:
  import Dropdown from '@octavian-tocan/react-dropdown';

  <Dropdown.Root
    items={items}
    selectedItem={selected}
    onSelect={setSelected}
    getItemKey={(item) => item.id}
    getItemDisplay={(item) => item.label}
  >
    <Dropdown.Trigger displayValue={selected?.label ?? ''} />
    <Dropdown.Simple />
  </Dropdown.Root>

See: https://github.com/OctavianTocan/react-dropdown#quick-start-copy--paste`
    );
  }

  return context as DropdownContextValue<T>;
}

/**
 * @brief Props for DropdownProvider component
 */
interface DropdownProviderProps<T> {
  children: ReactNode;
  value: DropdownContextValue<T>;
}

/**
 * @brief Provider component for dropdown context
 * @param props Provider props with children and context value
 * @returns JSX element providing context to children
 */
export function DropdownProvider<T>({ children, value }: DropdownProviderProps<T>) {
  return <DropdownContext.Provider value={value as DropdownContextValue<unknown>}>{children}</DropdownContext.Provider>;
}

/**
 * @brief Hook for managing keyboard navigation in dropdown
 * @param items Items to navigate through
 * @param getItemKey Function to get unique key for items
 * @param onSelect Callback when item is selected
 * @param closeDropdown Callback to close dropdown
 * @returns Object with keyboard event handlers
 */
export function useKeyboardNavigation<T>(
  items: T[],
  getItemKey: (item: T) => string,
  onSelect: (item: T) => void,
  closeDropdown: () => void
) {
  const focusedIndexRef = useRef<number>(-1);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  /**
   * @brief Handles keyboard events for navigation
   * @param event Keyboard event
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusedIndexRef.current = Math.min(focusedIndexRef.current + 1, items.length - 1);
        setFocusedIndex(focusedIndexRef.current);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusedIndexRef.current = Math.max(focusedIndexRef.current - 1, 0);
        setFocusedIndex(focusedIndexRef.current);
        break;
      case "Enter":
        event.preventDefault();
        if (focusedIndexRef.current >= 0 && focusedIndexRef.current < items.length) {
          onSelect(items[focusedIndexRef.current]);
        }
        break;
      case "Escape":
        event.preventDefault();
        closeDropdown();
        break;
    }
  };

  /**
   * @brief Resets focused index
   */
  const resetFocus = () => {
    focusedIndexRef.current = -1;
    setFocusedIndex(-1);
  };

  return {
    handleKeyDown,
    resetFocus,
    focusedIndex,
  };
}

/**
 * @brief Hook for managing click outside detection
 * @param dropdownRef Ref to dropdown element
 * @param closeDropdown Callback to close dropdown
 * @param isOpen Current open state
 */
export function useClickOutside(
  dropdownRef: React.RefObject<HTMLElement | null>,
  closeDropdown: () => void,
  isOpen: boolean
) {
  const closeDropdownRef = useRef(closeDropdown);
  closeDropdownRef.current = closeDropdown;

  const handleClickOutside = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!dropdownRef.current) return;

      const target = event.target as Node;
      if (!dropdownRef.current.contains(target)) {
        closeDropdownRef.current();
      }
    },
    [dropdownRef]
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener("mousedown", handleClickOutside, { passive: true });
    document.addEventListener("touchstart", handleClickOutside, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);
}
