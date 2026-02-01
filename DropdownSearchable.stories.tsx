import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { DropdownRoot, DropdownTrigger, DropdownSearchable } from './index';
import {
  simpleItems,
  languages,
  largeDataset,
  getLanguageKey,
  getLanguageDisplay,
  getItemKey,
  getItemDisplay,
  type Language,
} from './__storybook__/mock-data';
import { createDropdownStory } from './__storybook__/story-helpers';

type DropdownStoryArgs = {
  items?: any[];
  selectedItem?: any | null;
  onSelect?: (item: any | null) => void;
  disabled?: boolean;
  dropdownPlacement?: 'top' | 'bottom';
  placeholder?: string;
  triggerProps?: Record<string, any>;
  dropdownProps?: Record<string, any>;
};

/**
 * DropdownSearchable - Pre-made convenience component
 *
 * A pre-built dropdown that combines DropdownSearch and DropdownList
 * for the most common use case: a searchable item list.
 *
 * ## When to Use
 * - Lists with 15+ items that benefit from search
 * - Most common dropdown scenarios
 * - When you don't need custom header/footer sections
 *
 * ## When Not to Use
 * - Small lists (under 10-15 items) - use DropdownSimple instead
 * - When you need custom composition - use DropdownContent with custom children
 *
 * ## Features
 * - Built-in search functionality
 * - Auto-filters items as you type
 * - Shows "No results found" when filter returns empty
 * - Handles focus management automatically
 */
const meta: Meta<DropdownStoryArgs> = {
  title: 'Components/Dropdown/Prebuilt/Searchable',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Pre-made searchable dropdown combining search input and item list. Recommended for most use cases with 15+ items.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<DropdownStoryArgs>;

const BasicTemplate = createDropdownStory<string>({
  defaultItems: simpleItems,
  getItemKey: (item: string) => item,
  getItemDisplay: (item: string) => item,
});

const LanguageTemplate = createDropdownStory<Language>({
  defaultItems: languages,
  getItemKey: getLanguageKey,
  getItemDisplay: getLanguageDisplay,
});

const LargeDatasetTemplate = createDropdownStory<{ id: string; name: string }>({
  defaultItems: largeDataset,
  getItemKey: getItemKey,
  getItemDisplay: getItemDisplay,
});

/**
 * Default searchable dropdown
 * Basic implementation with simple string items
 */
export const Default: Story = {
  render: BasicTemplate,
  args: {
    placeholder: 'Select a fruit',
    triggerProps: { 'data-testid': 'searchable-trigger' },
    dropdownProps: { searchPlaceholder: 'Search fruits...' },
  },
};

/**
 * Custom search placeholder
 * Shows how to customize the search input text
 */
export const CustomPlaceholder: Story = {
  render: LanguageTemplate,
  args: {
    placeholder: 'Choose your language',
    triggerProps: { 'data-testid': 'custom-placeholder-trigger' },
    dropdownProps: { searchPlaceholder: 'Type to find your language...' },
  },
};

/**
 * Large dataset performance test
 * Demonstrates handling of 150+ items with search
 */
export const LargeDataset: Story = {
  render: LargeDatasetTemplate,
  args: {
    placeholder: 'Select an item',
    triggerProps: { 'data-testid': 'large-dataset-trigger' },
    dropdownProps: { searchPlaceholder: 'Search through 150 items...' },
  },
};

/**
 * Empty dataset
 * Shows the "No results found" state
 */
export const EmptyDataset: Story = {
  render: BasicTemplate,
  args: {
    items: [],
    placeholder: 'No items available',
    triggerProps: { 'data-testid': 'empty-dataset-trigger' },
    dropdownProps: { searchPlaceholder: 'Search...' },
  },
};

/**
 * With custom filter function
 * Shows how to implement case-sensitive or custom filtering
 */
export const CustomFilter: Story = {
  render: function CustomFilterStory(args) {
    const customFilter = (items: Language[], query: string) => {
      const lowerQuery = query.toLowerCase();
      return items.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerQuery) ||
          item.nativeName.toLowerCase().includes(lowerQuery) ||
          item.region.toLowerCase().includes(lowerQuery)
      );
    };

    const FilteredTemplate = createDropdownStory<Language>({
      defaultItems: languages,
      getItemKey: getLanguageKey,
      getItemDisplay: getLanguageDisplay,
      filterItems: customFilter,
    });

    return FilteredTemplate(args);
  },
  args: {
    placeholder: 'Select a language',
    triggerProps: { 'data-testid': 'custom-filter-trigger' },
    dropdownProps: {
      searchPlaceholder: 'Search by name, native name, or region...',
    },
  },
};

/**
 * Hide search for small lists
 * Demonstrates hiding search when items count is below threshold
 * Perfect for navigation menus with 4-5 items
 */
export const HideSearchForSmallLists: Story = {
  render: BasicTemplate,
  args: {
    items: ['Home', 'To-Do List', 'Transcribe', 'Record Call'],
    placeholder: 'Select a page',
    triggerProps: { 'data-testid': 'small-list-trigger' },
    dropdownProps: {
      hideSearchThreshold: 4,
      searchPlaceholder: 'Search...',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'When `hideSearchThreshold` is set and items.length <= threshold, search is hidden and all items are visible by default. Perfect for small navigation menus.',
      },
    },
  },
};
