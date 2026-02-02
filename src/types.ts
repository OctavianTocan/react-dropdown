/**
 * @file types.ts
 * @brief TypeScript interfaces for the reusable dropdown system
 */

import { ReactNode } from "react";

/**
 * @brief Supported dropdown placement options relative to the trigger
 */
export type DropdownPlacement = "bottom" | "top" | "auto";

/**
 * @brief Animation state for the dropdown
 */
export type DropdownAnimationState = "entering" | "exiting" | "idle";

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
  "data-testid"?: string;
  /** Optional children elements */
  children?: ReactNode;
}

/**
 * @brief Props for DropdownRoot component
 *
 * @example Basic usage
 * ```tsx
 * <Dropdown.Root
 *   items={items}
 *   selectedItem={selected}
 *   onSelect={setSelected}
 *   getItemKey={(item) => item.id}
 *   getItemDisplay={(item) => item.label}
 * >
 *   <Dropdown.Trigger displayValue={selected?.label ?? ''} />
 *   <Dropdown.Simple />
 * </Dropdown.Root>
 * ```
 */
export interface DropdownRootProps<T> extends BaseDropdownProps {
  /**
   * Array of items to display
   * @example
   * ```tsx
   * const items = [{ id: '1', label: 'Option 1' }, { id: '2', label: 'Option 2' }];
   * <Dropdown.Root items={items} ... />
   * ```
   */
  items: T[];
  /** Currently selected item */
  selectedItem?: T | null;
  /**
   * Callback invoked when selection changes
   * @example
   * ```tsx
   * <Dropdown.Root onSelect={(item) => setSelected(item)} ... />
   * ```
   */
  onSelect: (item: T) => void;
  /**
   * Function to get unique key for each item
   * @example
   * ```tsx
   * <Dropdown.Root getItemKey={(item) => item.id} ... />
   * ```
   */
  getItemKey: (item: T) => string;
  /**
   * Function to get display text for each item
   * @example
   * ```tsx
   * <Dropdown.Root getItemDisplay={(item) => item.label} ... />
   * ```
   */
  getItemDisplay: (item: T) => string;
  /**
   * Optional function to filter items based on search query
   * @example
   * ```tsx
   * <Dropdown.Root
   *   filterItems={(items, query) =>
   *     items.filter(item => item.label.toLowerCase().includes(query.toLowerCase()))
   *   }
   *   ...
   * />
   * ```
   */
  filterItems?: (items: T[], query: string) => T[];
  /** Whether the dropdown is disabled */
  disabled?: boolean;
  /** Optional placeholder text for trigger */
  placeholder?: string;
  /**
   * Dropdown placement relative to the trigger.
   * - 'bottom': Always opens downward
   * - 'top': Always opens upward
   * - 'auto': Automatically detects best placement based on viewport position
   * Default: 'bottom'
   * @example
   * ```tsx
   * <Dropdown.Root placement="auto" ... />
   * ```
   */
  placement?: DropdownPlacement;
  /** @deprecated Use `placement` instead. Will be removed in next major version. */
  dropdownPlacement?: DropdownPlacement;
  /** Distance in pixels between trigger and dropdown content. Default: 8 */
  offset?: number;
  /**
   * Optional function to retrieve description text shown beneath the label
   * @example
   * ```tsx
   * <Dropdown.Root getItemDescription={(item) => item.description} ... />
   * ```
   */
  getItemDescription?: (item: T) => string | null | undefined;
  /**
   * Optional function to retrieve an icon rendered alongside the label
   * @example
   * ```tsx
   * <Dropdown.Root getItemIcon={(item) => <Icon name={item.icon} />} ... />
   * ```
   */
  getItemIcon?: (item: T) => ReactNode;
  /**
   * Optional function to group items under labeled section headers
   * @example
   * ```tsx
   * <Dropdown.Root
   *   getItemSection={(item) => ({
   *     key: item.category,
   *     label: item.category,
   *     icon: '📁'
   *   })}
   *   ...
   * />
   * ```
   */
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
  /**
   * Whether to render dropdown in a portal (avoids overflow clipping)
   * @example
   * ```tsx
   * <Dropdown.Root usePortal={true} ... />
   * ```
   */
  usePortal?: boolean;
  /** Duration in seconds for enter animation. Default: 0.2 */
  enterDuration?: number;
  /** Duration in seconds for exit animation. Default: 0.15 */
  exitDuration?: number;
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
  /** Disable animations (useful for mobile or performance) */
  disableAnimation?: boolean;
  /** Whether to render dropdown in a portal. Default: false */
  portal?: boolean;
  /** Custom container element for portal rendering. Default: document.body */
  portalContainer?: Element;
  /** Whether to show a backdrop behind the dropdown. Default: false */
  backdrop?: boolean;
  /** Custom className for the backdrop element */
  backdropClassName?: string;
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
  /** Whether to use staggered animations for list items. Default: false */
  staggered?: boolean;
  /** Delay in seconds between each item animation when staggered is true. Default: 0.04 */
  staggerDelay?: number;
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
 * @brief Props for DropdownHeader component
 */
export interface DropdownHeaderProps extends BaseDropdownProps {
  /** Whether to show a separator line below the header. Default: false */
  separator?: boolean;
}

/**
 * @brief Props for DropdownFooter component
 */
export interface DropdownFooterProps extends BaseDropdownProps {
  /** Whether to show a separator line above the footer. Default: true */
  separator?: boolean;
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
  /** Function to close dropdown with exit animation */
  closeDropdown: () => void;
  /** Function to close dropdown immediately without exit animation */
  closeImmediate: () => void;
  /** Function to toggle dropdown open/closed state */
  toggleDropdown: () => void;
  /** Current animation state of the dropdown */
  animationState: DropdownAnimationState;
  /** Computed placement after auto-detection (always 'top' or 'bottom') */
  computedPlacement: "top" | "bottom";
  /** @deprecated Use computedPlacement instead */
  dropdownPlacement?: DropdownPlacement;
  /** Distance in pixels between trigger and dropdown content */
  offset: number;
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
  /** Duration in seconds for enter animation */
  enterDuration: number;
  /** Duration in seconds for exit animation */
  exitDuration: number;
}
