import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
  DropdownRoot,
  DropdownTrigger,
  DropdownContent,
  DropdownSearch,
  DropdownList,
  DropdownSearchable,
} from '../index';
import { simpleItems, getLanguageKey, getLanguageDisplay } from '../__storybook__/mock-data';
import { createDropdownStory, dropdownRootArgTypes } from '../__storybook__/story-helpers';

type DropdownStoryArgs = {
  items?: string[];
  selectedItem?: string | null;
  onSelect?: (item: string | null) => void;
  disabled?: boolean;
  dropdownPlacement?: 'top' | 'bottom';
  placeholder?: string;
  triggerProps?: Record<string, any>;
  dropdownProps?: Record<string, any>;
};

/**
 * Dropdown component system for selecting items from a list
 *
 * The Dropdown provides a flexible, composable dropdown selection system with:
 * - Type-safe generic implementation
 * - Search/filter capabilities
 * - Keyboard navigation
 * - Accessible ARIA attributes
 * - Custom composition or pre-made convenience components
 */
const meta: Meta<DropdownStoryArgs> = {
  title: 'Components/Dropdown/Core/Root',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible, type-safe dropdown component for selecting items from a list. Supports search, keyboard navigation, and custom composition patterns.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: dropdownRootArgTypes,
};

export default meta;
type Story = StoryObj<DropdownStoryArgs>;

// Create the basic template for simple strings
const BasicTemplate = createDropdownStory<string>({
  defaultItems: simpleItems,
  getItemKey: (item: string) => item,
  getItemDisplay: (item: string) => item,
});

/**
 * Basic usage with simple string array
 */
export const BasicUsage: Story = {
  render: BasicTemplate,
  args: {
    items: simpleItems,
    placeholder: 'Select a fruit',
    triggerProps: { 'data-testid': 'dropdown-trigger' },
    dropdownProps: { searchPlaceholder: 'Search fruits...' },
  },
};

/**
 * Disabled state
 */
export const DisabledState: Story = {
  render: BasicTemplate,
  args: {
    items: simpleItems,
    disabled: true,
    placeholder: 'Dropdown is disabled',
    triggerProps: { 'data-testid': 'disabled-dropdown-trigger' },
  },
};

/**
 * Top placement - renders dropdown above trigger
 */
export const TopPlacement: Story = {
  render: BasicTemplate,
  args: {
    items: simpleItems,
    dropdownPlacement: 'top',
    placeholder: 'Select an option',
    triggerProps: { 'data-testid': 'top-placement-trigger' },
  },
  decorators: [
    (Story) => (
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-gray-500">
          Dropdown renders above to avoid clipping near sticky footers.
        </p>
        <Story />
      </div>
    ),
  ],
};

/**
 * Empty state
 */
export const EmptyState: Story = {
  render: BasicTemplate,
  args: {
    items: [],
    placeholder: 'No items available',
    triggerProps: { 'data-testid': 'empty-dropdown-trigger' },
    dropdownProps: { searchPlaceholder: 'Search...' },
  },
};

/**
 * Custom composition with header and footer
 */
export const CustomComposition: Story = {
  render: function CustomCompositionStory() {
    const [selected, setSelected] = React.useState<string | null>(null);
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredItems = simpleItems.filter((item) =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <DropdownRoot
        items={filteredItems}
        selectedItem={selected}
        onSelect={setSelected}
        getItemKey={(item: string) => item}
        getItemDisplay={(item: string) => item}
        placeholder="Select a team member"
      >
        <DropdownTrigger
          displayValue={selected ?? ''}
          placeholder="Select a team member"
          data-testid="custom-dropdown-trigger"
        />
        <DropdownContent data-testid="custom-dropdown-content">
          <div className="px-3 py-2 bg-blue-50 border-b border-blue-100 text-sm text-blue-800">
            Available Options ({filteredItems.length})
          </div>
          <DropdownSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search..."
            data-testid="custom-dropdown-search"
          />
          <DropdownList
            items={filteredItems}
            onSelect={setSelected}
            hasResults={filteredItems.length > 0}
            selectedItem={selected}
            getItemKey={(item: string) => item}
            getItemDisplay={(item: string) => item}
            data-testid="custom-dropdown-list"
          />
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
            Need more options? Contact your admin
          </div>
        </DropdownContent>
      </DropdownRoot>
    );
  },
};
