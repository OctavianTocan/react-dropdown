/**
 * @file DropdownRoot.tsx
 * @brief Main provider component for dropdown functionality
 */

'use client';

import { useState, useCallback, useRef, useMemo, useLayoutEffect } from 'react';
import { DropdownProvider, useClickOutside } from './DropdownContext';
import type { DropdownRootProps, DropdownContextValue } from './types';

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
  className = '',
  dropdownPlacement = 'bottom',
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
  'data-testid': testId = 'dropdown-root',
}: DropdownRootProps<T>) {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(initialSelectedItem);
  const [searchQuery, setSearchQuery] = useState('');

  // Refs for DOM manipulation
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Default filter function if not provided
  const defaultFilter = useCallback(
    (items: T[], query: string) => {
      if (!query.trim()) {
        return items;
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

  /**
   * @brief Opens the dropdown and focuses search input
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
   * @brief Closes the dropdown and clears search
   */
  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
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
      toggleDropdown,
      dropdownPlacement,
      getItemDescription,
      getItemIcon,
      getItemSection,
      getItemSeparator,
      getItemDisabled,
      getItemClassName,
      triggerRef,
      usePortal,
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
      toggleDropdown,
      dropdownPlacement,
      getItemDescription,
      getItemIcon,
      getItemSection,
      getItemSeparator,
      getItemDisabled,
      getItemClassName,
      triggerRef,
      usePortal,
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
