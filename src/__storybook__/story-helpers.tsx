import React from "react";

import type { DropdownContextValue } from "../types";

// StoryContext type stub for when @storybook/react is not installed
type StoryContext<TArgs = unknown> = { args: TArgs };
import { DropdownRoot, DropdownTrigger, DropdownSearchable, DropdownSimple } from "../index";

/**
 * Helper function to create a controlled dropdown template for Storybook
 * This enables args-panel controls and proper action logging
 */
export function createDropdownStory<T = string>(config: {
  defaultItems?: T[];
  defaultSelectedItem?: T | null;
  getItemKey?: (item: T) => string;
  getItemDisplay?: (item: T) => string;
  getItemDescription?: (item: T) => string;
  getItemIcon?: (item: T) => React.ReactNode;
  getItemSection?: (item: T) => {
    key: string;
    label: string;
    description?: string;
    icon?: string;
  };
  filterItems?: (items: T[], query: string) => T[];
}) {
  const {
    defaultItems = [],
    defaultSelectedItem = null,
    getItemKey = <T,>(item: T): string => {
      if (typeof item === "string") return item;
      if (typeof item === "number") return String(item);
      if (item && typeof item === "object" && "id" in item) return String((item as { id: unknown }).id);
      return "";
    },
    getItemDisplay = <T,>(item: T): string => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "name" in item) return String((item as { name: unknown }).name);
      return String(item);
    },
    getItemDescription,
    getItemIcon,
    getItemSection,
    filterItems,
  } = config;

  return function Template({
    items = defaultItems,
    selectedItem: initialSelectedItem = defaultSelectedItem,
    onSelect = () => {},
    disabled = false,
    dropdownPlacement = "bottom",
    placeholder = "Select an option",
    triggerProps = {},
    dropdownProps = {},
  }: {
    items?: T[];
    selectedItem?: T | null;
    onSelect?: (item: T | null) => void;
    disabled?: boolean;
    dropdownPlacement?: "top" | "bottom";
    placeholder?: string;
    triggerProps?: Record<string, unknown>;
    dropdownProps?: Record<string, unknown>;
  }) {
    const [selected, setSelected] = React.useState<T | null>(initialSelectedItem);

    const handleSelect = React.useCallback(
      (item: T | null) => {
        setSelected(item);
        onSelect(item);
      },
      [onSelect]
    );

    return (
      <DropdownRoot
        items={items}
        selectedItem={selected}
        onSelect={handleSelect}
        getItemKey={getItemKey}
        getItemDisplay={getItemDisplay}
        getItemDescription={getItemDescription}
        getItemIcon={getItemIcon}
        getItemSection={getItemSection}
        filterItems={filterItems}
        disabled={disabled}
        dropdownPlacement={dropdownPlacement}
        placeholder={placeholder}
      >
        <DropdownTrigger
          displayValue={selected ? getItemDisplay(selected) : ""}
          placeholder={placeholder}
          {...triggerProps}
        />
        {Array.isArray(items) && items.length > 10 ? (
          <DropdownSearchable
            searchPlaceholder={`Search...`}
            hideSearchThreshold={dropdownProps?.hideSearchThreshold as number | undefined}
            {...dropdownProps}
          />
        ) : (
          <DropdownSimple {...dropdownProps} />
        )}
      </DropdownRoot>
    );
  };
}

/**
 * Mock context provider for isolated component testing
 */
export function createMockContext<T = unknown>(
  overrides: Partial<DropdownContextValue<T>> = {}
): DropdownContextValue<T> {
  return {
    isOpen: false,
    setIsOpen: () => {},
    selectedItem: null,
    setSelectedItem: () => {},
    searchQuery: "",
    setSearchQuery: () => {},
    items: [] as T[],
    filteredItems: [] as T[],
    getItemKey: (item: T): string => {
      if (typeof item === "string") return item;
      if (typeof item === "number") return String(item);
      if (item && typeof item === "object" && "id" in item) return String((item as { id: unknown }).id);
      return "";
    },
    getItemDisplay: (item: T): string => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "name" in item) return String((item as { name: unknown }).name);
      return String(item);
    },
    filterItems: (items: T[]) => items,
    onSelect: () => {},
    disabled: false,
    closeOnSelect: true,
    closeDropdown: () => {},
    closeImmediate: () => {},
    toggleDropdown: () => {},
    animationState: "idle",
    computedPlacement: "bottom",
    offset: 8,
    enterDuration: 0.2,
    exitDuration: 0.15,
    dropdownPlacement: "bottom" as const,
    ...overrides,
  };
}

/**
 * Common decorator for dropdown stories that need context
 */
export function withDropdownContext() {
  return function StoryDecorator<StoryArgs extends Record<string, unknown>>(
    Story: React.ComponentType<StoryArgs>,
    context: StoryContext<StoryArgs>
  ) {
    return <Story {...context.args} />;
  };
}

/**
 * Standard argTypes for dropdown root stories
 */
export const dropdownRootArgTypes = {
  items: {
    description: "Array of selectable items",
    control: { type: "object" as const },
  },
  selectedItem: {
    description: "Currently selected item",
    control: { type: "object" as const },
  },
  disabled: {
    description: "Disable the dropdown",
    control: { type: "boolean" as const },
  },
  dropdownPlacement: {
    description: "Where the dropdown appears relative to the trigger",
    control: { type: "select" as const },
    options: ["top", "bottom"],
  },
  placeholder: {
    description: "Placeholder text for when no item is selected",
    control: { type: "text" as const },
  },
  "triggerProps.data-testid": {
    description: "Test ID for the trigger element",
    control: { type: "text" as const },
  },
  "dropdownProps.searchPlaceholder": {
    description: "Search input placeholder text",
    control: { type: "text" as const },
  },
};
