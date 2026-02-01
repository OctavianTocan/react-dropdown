import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

/**
 * @file types.ts
 * @brief TypeScript interfaces for the reusable dropdown system
 */

/**
 * @brief Supported dropdown placement options relative to the trigger
 */
type DropdownPlacement = 'bottom' | 'top';
/**
 * @brief Metadata used to render grouped sections inside the dropdown list
 */
interface DropdownSectionMeta {
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
interface BaseDropdownProps {
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
interface DropdownRootProps<T> extends BaseDropdownProps {
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
interface DropdownTriggerProps extends BaseDropdownProps {
    /** Display text to show in trigger */
    displayValue: string;
    /** Placeholder text when no value is selected */
    placeholder?: string;
}
/**
 * @brief Props for DropdownContent component (pure container)
 */
interface DropdownContentProps$1 extends BaseDropdownProps {
}
/**
 * @brief Props for DropdownSearch component
 */
interface DropdownSearchProps extends BaseDropdownProps {
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
interface DropdownListProps<T> extends BaseDropdownProps {
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
interface DropdownOptionProps<T> extends BaseDropdownProps {
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
interface DropdownContextValue<T> {
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
declare function DropdownRoot<T>({ children, items, selectedItem: initialSelectedItem, onSelect, getItemKey, getItemDisplay, filterItems, disabled, placeholder, className, dropdownPlacement, getItemDescription, getItemIcon, getItemSection, getItemSeparator, getItemDisabled, getItemClassName, closeOnSelect, onOpenChange, triggerRef, usePortal, 'data-testid': testId, }: DropdownRootProps<T>): react_jsx_runtime.JSX.Element;

/**
 * @brief Trigger button that opens/closes the dropdown
 *
 * This component renders the button that users click to open the dropdown.
 * It displays the current selection or placeholder text and includes
 * a dropdown arrow indicator.
 *
 * @param props Trigger configuration and callbacks
 * @returns JSX element for the trigger button
 */
declare function DropdownTrigger({ displayValue, placeholder, className, 'data-testid': testId, }: DropdownTriggerProps): react_jsx_runtime.JSX.Element;

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
declare function DropdownContent({ children, className, disableAnimation, 'data-testid': testId, }: DropdownContentProps): react_jsx_runtime.JSX.Element;

/**
 * @brief Search input component for filtering dropdown items
 *
 * This component provides a search input that filters the dropdown items
 * as the user types. It prevents tabbing out of the input
 * and includes proper accessibility attributes.
 *
 * @param props Search input configuration
 * @returns JSX element for the search input
 */
declare const DropdownSearch: ({ value, onChange, inputRef, placeholder, className, "data-testid": testId, }: DropdownSearchProps) => react_jsx_runtime.JSX.Element;

/**
 * @brief List component for displaying dropdown options
 * @description Renders a scrollable list of items with support for grouping, separators,
 * icons, descriptions, and custom styling. Handles scrolling the selected item into view
 * when the list opens and provides proper accessibility attributes. Items can be grouped
 * into sections with headers, and separators can be added between items.
 * @template T The type of items in the dropdown
 * @param props List configuration and items
 * @param props.items Array of items to display in the dropdown
 * @param props.onSelect Optional custom callback when an item is selected
 * @param props.hasResults Whether there are results to display
 * @param props.selectedItem Currently selected item
 * @param props.getItemKey Function to get unique key for each item
 * @param props.getItemDisplay Function to get display text for each item
 * @param props.renderItem Optional custom render function for items
 * @param props.getItemDescription Optional function to get description text
 * @param props.getItemIcon Optional function to get icon element
 * @param props.getItemSection Optional function to get section metadata
 * @param props.getItemSeparator Optional function to determine if separator should appear
 * @param props.getItemDisabled Optional function to determine if item is disabled
 * @param props.getItemClassName Optional function to get custom className
 * @param props.className Additional CSS classes for the list container
 * @param props['data-testid'] Test ID for the list element
 * @returns JSX element for the item list
 */
declare function DropdownList<T>({ items, onSelect: customOnSelect, hasResults, selectedItem, getItemKey, getItemDisplay, renderItem, getItemDescription, getItemIcon, getItemSection, getItemSeparator, getItemDisabled, getItemClassName, className, 'data-testid': testId, }: DropdownListProps<T>): react_jsx_runtime.JSX.Element;

/**
 * @file DropdownSearchable.tsx
 * @brief Pre-made dropdown with search and list
 */
/**
 * @brief Pre-configured dropdown with search input and list
 *
 * This is a convenience component that combines DropdownSearch and DropdownList.
 * Use this for the common case where you want a searchable dropdown.
 * For custom compositions, use DropdownContent with your own children.
 *
 * @param props Dropdown configuration
 * @returns JSX element for searchable dropdown or null if closed
 */
declare function DropdownSearchable({ searchPlaceholder, className, 'data-testid': testId, hideSearchThreshold, }: {
    searchPlaceholder?: string;
    className?: string;
    'data-testid'?: string;
    /**
     * Maximum number of items before search is shown.
     * If items.length <= hideSearchThreshold, search input is hidden.
     * Useful for small lists (e.g., 4 navigation items) where search is unnecessary.
     * Default: undefined (always show search)
     */
    hideSearchThreshold?: number;
}): react_jsx_runtime.JSX.Element;

/**
 * @file DropdownSimple.tsx
 * @brief Pre-made dropdown with list only (no search)
 */
/**
 * @brief Pre-configured dropdown with list only
 *
 * This is a convenience component that provides just a list without search.
 * Use this for simple dropdowns with small item counts where search isn't needed.
 * For custom compositions, use DropdownContent with your own children.
 *
 * @param props Dropdown configuration
 * @returns JSX element for simple dropdown or null if closed
 */
declare function DropdownSimple({ className, 'data-testid': testId, }: {
    className?: string;
    'data-testid'?: string;
}): react_jsx_runtime.JSX.Element;

/**
 * @brief Props for DropdownMenu component
 */
interface DropdownMenuProps<T> extends Omit<DropdownRootProps<T>, 'selectedItem' | 'triggerRef'> {
    /** Custom trigger component (button, icon, etc.) */
    trigger: ReactNode;
    /** Optional className for the dropdown content container */
    contentClassName?: string;
    /** Optional className for the dropdown list */
    listClassName?: string;
    /** Optional callback invoked when dropdown open state changes */
    onOpenChange?: (isOpen: boolean) => void;
}
/**
 * @brief DropdownMenu component - optimized for action menus
 *
 * This is a variant component that simplifies creating action menus (like context menus,
 * three-dot menus, etc.) with built-in support for separators, disabled states, and custom styling.
 *
 * @example
 * ```tsx
 * interface MenuItem {
 *   id: string;
 *   label: string;
 *   icon: ReactNode;
 *   onClick: () => void;
 *   disabled?: boolean;
 *   showSeparator?: boolean;
 * }
 *
 * const items: MenuItem[] = [
 *   { id: '1', label: 'Edit', icon: <Edit />, onClick: handleEdit },
 *   { id: '2', label: 'Delete', icon: <Trash />, onClick: handleDelete, showSeparator: true },
 * ];
 *
 * <DropdownMenu
 *   items={items}
 *   trigger={<MoreHorizontal />}
 *   onSelect={(item) => item.onClick()}
 *   getItemKey={(item) => item.id}
 *   getItemDisplay={(item) => item.label}
 *   getItemIcon={(item) => item.icon}
 *   getItemSeparator={(item) => item.showSeparator ?? false}
 *   getItemDisabled={(item) => item.disabled ?? false}
 *   contentClassName="right-0! top-full! mt-2! bg-white border border-gray-200 rounded-2xl shadow-lg p-2 gap-1.5 z-50 min-w-[200px]"
 * />
 * ```
 */
declare function DropdownMenu<T>({ items, onSelect, getItemKey, getItemDisplay, getItemIcon, getItemDescription, getItemSeparator, getItemDisabled, getItemClassName, getItemSection, filterItems, disabled, placeholder, className, dropdownPlacement, closeOnSelect, trigger, contentClassName, listClassName, onOpenChange, usePortal, 'data-testid': testId, }: DropdownMenuProps<T>): react_jsx_runtime.JSX.Element;

/**
 * @brief Hook to access dropdown context
 * @throws Error if used outside DropdownProvider
 * @returns Dropdown context value
 */
declare function useDropdownContext<T>(): DropdownContextValue<T>;
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
declare function DropdownProvider<T>({ children, value }: DropdownProviderProps<T>): react_jsx_runtime.JSX.Element;
/**
 * @brief Hook for managing keyboard navigation in dropdown
 * @param items Items to navigate through
 * @param getItemKey Function to get unique key for items
 * @param onSelect Callback when item is selected
 * @param closeDropdown Callback to close dropdown
 * @returns Object with keyboard event handlers
 */
declare function useKeyboardNavigation<T>(items: T[], getItemKey: (item: T) => string, onSelect: (item: T) => void, closeDropdown: () => void): {
    handleKeyDown: (event: React.KeyboardEvent) => void;
    resetFocus: () => void;
    focusedIndex: number;
};
/**
 * @brief Hook for managing click outside detection
 * @param dropdownRef Ref to dropdown element
 * @param closeDropdown Callback to close dropdown
 * @param isOpen Current open state
 */
declare function useClickOutside(dropdownRef: React.RefObject<HTMLElement>, closeDropdown: () => void, isOpen: boolean): void;

/**
 * @brief Compound dropdown component
 *
 * This provides a compound component pattern where all sub-components
 * are attached to the main DropdownRoot component for easy composition.
 * Includes both pure composition components and pre-made convenience components.
 */
declare const Dropdown: {
    Root: typeof DropdownRoot;
    Trigger: typeof DropdownTrigger;
    Content: typeof DropdownContent;
    Search: ({ value, onChange, inputRef, placeholder, className, "data-testid": testId, }: DropdownSearchProps) => react_jsx_runtime.JSX.Element;
    List: typeof DropdownList;
    Simple: typeof DropdownSimple;
    Searchable: typeof DropdownSearchable;
    Menu: typeof DropdownMenu;
};

export { type BaseDropdownProps, DropdownContent, type DropdownContentProps$1 as DropdownContentProps, type DropdownContextValue, DropdownList, type DropdownListProps, DropdownMenu, type DropdownMenuProps, type DropdownOptionProps, type DropdownPlacement, DropdownProvider, DropdownRoot, type DropdownRootProps, DropdownSearch, type DropdownSearchProps, DropdownSearchable, type DropdownSectionMeta, DropdownSimple, DropdownTrigger, type DropdownTriggerProps, Dropdown as default, useClickOutside, useDropdownContext, useKeyboardNavigation };
