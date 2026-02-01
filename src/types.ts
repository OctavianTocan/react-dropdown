/**
 * @file types.ts
 * @brief TypeScript interfaces for the reusable dropdown system
 */

import { ReactNode } from 'react';

/**
 * @brief Supported dropdown placement options relative to the trigger
 */
export type DropdownPlacement = 'bottom' | 'top';

/**
 * @brief Metadata used to render grouped sections inside the dropdown list
 */
export interface DropdownSectionMeta {
  /** Stable identifier for the section used as React key */
  key: string;
  /** Human-readable label for the section header */
  label: string;
  /** Optional helper text describing the section */
  description?: string;
  /** Optional icon rendered next to the section label */
  icon?: ReactNode;
}

/**
 * @brief Base props for all dropdown components
 */
export interface BaseDropdownProps {
  /** Optional CSS class name for custom styling */
  className?: string;
  /** Optional test identifier for automated testing */
  'data-testid'?: string;
  /** Optional children elements */
  children?: ReactNode;
}

/**
 * @brief Props for DropdownRoot component
 */
export interface DropdownRootProps<T> extends BaseDropdownProps {
  /** Array of items to display */
  items: T[];
  /** Currently selected item */
  selectedItem?: T | null;
  /** Callback invoked when selection changes */
  onSelect: (item: T) => void;
  /** Function to get unique key for each item */
  getItemKey: (item: T) => string;
  /** Function to get display text for each item */
  getItemDisplay: (item: T) => string;
  /** Optional function to filter items based on search query */
  filterItems?: (items: T[], query: string) => T[];
  /** Whether the dropdown is disabled */
  disabled?: boolean;
  /** Optional placeholder text for trigger */
  placeholder?: string;
  /** Optional placement configuration for the dropdown */
  dropdownPlacement?: DropdownPlacement;
  /** Optional function to retrieve description text shown beneath the label */
  getItemDescription?: (item: T) => string | null | undefined;
  /** Optional function to retrieve an icon rendered alongside the label */
  getItemIcon?: (item: T) => ReactNode;
  /** Optional function to group items under labeled section headers */
  getItemSection?: (item: T) => DropdownSectionMeta | null | undefined;
  /** Optional function to determine if item should show a separator before it */
  getItemSeparator?: (item: T, index: number) => boolean;
  /** Optional function to determine if item is disabled */
  getItemDisabled?: (item: T) => boolean;
  /** Optional function to get custom className for item */
  getItemClassName?: (item: T, isSelected: boolean, isDisabled: boolean) => string;
  /**
   * Whether to close the dropdown automatically when an item is selected.
   * Default: true. Set to false to keep dropdown open after selection (useful for multi-select scenarios).
   */
  closeOnSelect?: boolean;
  /** Optional callback invoked when dropdown open state changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** Ref to the trigger element for portal positioning */
  triggerRef?: React.RefObject<HTMLElement | null>;
  /** Whether to render dropdown in a portal (avoids overflow clipping) */
  usePortal?: boolean;
}

/**
 * @brief Props for DropdownTrigger component
 */
export interface DropdownTriggerProps extends BaseDropdownProps {
  /** Display text to show in trigger */
  displayValue: string;
  /** Placeholder text when no value is selected */
  placeholder?: string;
}

/**
 * @brief Props for DropdownContent component (pure container)
 */
export interface DropdownContentProps extends BaseDropdownProps {
  // DropdownContent is now a pure container that accepts children
}

/**
 * @brief Props for DropdownSearch component
 */
export interface DropdownSearchProps extends BaseDropdownProps {
  /** Current search query */
  value: string;
  /** Callback when search query changes */
  onChange: (value: string) => void;
  /** Ref for input element */
  inputRef?: React.RefObject<HTMLInputElement>;
  /** Placeholder text for search input */
  placeholder?: string;
}

/**
 * @brief Props for DropdownList component
 */
export interface DropdownListProps<T> extends BaseDropdownProps {
  /** Items to display in list */
  items: T[];
  /** Optional callback when item is selected. If not provided, uses context's onSelect */
  onSelect?: (item: T) => void;
  /** Whether there are results to display */
  hasResults: boolean;
  /** Currently selected item */
  selectedItem?: T | null;
  /** Function to get unique key for each item */
  getItemKey: (item: T) => string;
  /** Function to get display text for each item */
  getItemDisplay: (item: T) => string;
  /** Optional custom render function for items */
  renderItem?: (item: T, isSelected: boolean, onSelect: (item: T) => void) => ReactNode;
  /** Optional function for displaying supporting description text */
  getItemDescription?: (item: T) => string | null | undefined;
  /** Optional function for rendering an icon element before the label */
  getItemIcon?: (item: T) => ReactNode;
  /** Optional function for grouping items into section headers */
  getItemSection?: (item: T) => DropdownSectionMeta | null | undefined;
  /** Optional function to determine if item should show a separator before it */
  getItemSeparator?: (item: T, index: number) => boolean;
  /** Optional function to determine if item is disabled */
  getItemDisabled?: (item: T) => boolean;
  /** Optional function to get custom className for item */
  getItemClassName?: (item: T, isSelected: boolean, isDisabled: boolean) => string;
}

/**
 * @brief Props for DropdownOption component
 */
export interface DropdownOptionProps<T> extends BaseDropdownProps {
  /** Item to display */
  item: T;
  /** Callback when option is selected */
  onSelect: (item: T) => void;
  /** Whether this option is currently selected */
  isSelected: boolean;
  /** Display text for the option */
  displayText: string;
  /** Data key attribute for the option */
  dataKey: string;
  /** Optional supporting description shown under the primary label */
  description?: string | null;
  /** Optional icon element rendered before the label */
  icon?: ReactNode;
  /** Whether this option is disabled */
  isDisabled?: boolean;
  /** Optional custom className for the option */
  className?: string;
}

/**
 * @brief Dropdown context value interface
 */
export interface DropdownContextValue<T> {
  /** Current open/closed state */
  isOpen: boolean;
  /** Function to set open state */
  setIsOpen: (open: boolean) => void;
  /** Currently selected item */
  selectedItem: T | null;
  /** Function to set selected item */
  setSelectedItem: (item: T | null) => void;
  /** Current search query */
  searchQuery: string;
  /** Function to set search query */
  setSearchQuery: (query: string) => void;
  /** Items to display */
  items: T[];
  /** Filtered items based on search query */
  filteredItems: T[];
  /** Function to get unique key for each item */
  getItemKey: (item: T) => string;
  /** Function to get display text for each item */
  getItemDisplay: (item: T) => string;
  /** Function to filter items based on search query */
  filterItems: (items: T[], query: string) => T[];
  /** Callback when item is selected */
  onSelect: (item: T) => void;
  /** Whether the dropdown is disabled */
  disabled: boolean;
  /** Whether to close dropdown on selection */
  closeOnSelect: boolean;
  /** Function to close dropdown */
  closeDropdown: () => void;
  /** Function to toggle dropdown open/closed state */
  toggleDropdown: () => void;
  /** Placement configuration shared with dropdown components */
  dropdownPlacement?: DropdownPlacement;
  /** Optional function to retrieve supporting descriptions */
  getItemDescription?: (item: T) => string | null | undefined;
  /** Optional function to retrieve icon elements */
  getItemIcon?: (item: T) => ReactNode;
  /** Optional function to group items by section metadata */
  getItemSection?: (item: T) => DropdownSectionMeta | null | undefined;
  /** Optional function to determine if item should show a separator before it */
  getItemSeparator?: (item: T, index: number) => boolean;
  /** Optional function to determine if item is disabled */
  getItemDisabled?: (item: T) => boolean;
  /** Optional function to get custom className for item */
  getItemClassName?: (item: T, isSelected: boolean, isDisabled: boolean) => string;
  /** Ref to the trigger element for portal positioning */
  triggerRef?: React.RefObject<HTMLElement | null>;
  /** Whether to render dropdown in a portal */
  usePortal?: boolean;
}
