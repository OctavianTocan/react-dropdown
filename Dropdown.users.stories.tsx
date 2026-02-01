import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import {
  DropdownRoot,
  DropdownTrigger,
  DropdownContent,
  DropdownSearch,
  DropdownList,
  DropdownProvider,
} from './index';
import { createDropdownStory, createMockContext } from './__storybook__/story-helpers';
import { users, getUserKey, getUserDisplay, type User } from './__storybook__/mock-data';

type DropdownStoryArgs = {
  items?: User[];
  selectedItem?: User | null;
  onSelect?: (item: User | null) => void;
  disabled?: boolean;
  dropdownPlacement?: 'top' | 'bottom';
  placeholder?: string;
  triggerProps?: Record<string, any>;
  dropdownProps?: Record<string, any>;
};

/**
 * User dropdown stories
 *
 * Real-world examples using user data with roles and avatars.
 * Demonstrates custom composition with headers and footers.
 */
const meta: Meta<DropdownStoryArgs> = {
  title: 'Components/Dropdown/Examples/Users',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'User dropdown with roles, avatars, and custom composition.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      description: 'Array of user objects',
      control: { type: 'object' as const },
    },
    selectedItem: {
      description: 'Currently selected user',
      control: { type: 'object' as const },
    },
    disabled: {
      description: 'Disable the dropdown',
      control: { type: 'boolean' as const },
    },
    dropdownPlacement: {
      description: 'Where the dropdown appears relative to the trigger',
      control: { type: 'select' as const },
      options: ['top', 'bottom'],
    },
    placeholder: {
      description: 'Placeholder text for when no user is selected',
      control: { type: 'text' as const },
    },
  },
};

export default meta;
type Story = StoryObj<DropdownStoryArgs>;

const UserTemplate = createDropdownStory<User>({
  defaultItems: users,
  getItemKey: getUserKey,
  getItemDisplay: getUserDisplay,
});

/**
 * Basic user dropdown
 */
export const Basic: Story = {
  render: UserTemplate,
  args: {
    placeholder: 'Select a user',
    triggerProps: { 'data-testid': 'user-dropdown-trigger' },
    dropdownProps: { searchPlaceholder: 'Search by name or role...' },
  },
};

/**
 * User dropdown with custom composition
 * Shows header/footer and enhanced formatting
 */
export const WithCustomComposition: Story = {
  render: function WithCustomCompositionStory() {
    const [selected, setSelected] = React.useState<User | null>(null);
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredUsers = users.filter(
      (user) =>
        getUserDisplay(user).toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <DropdownRoot
        items={filteredUsers}
        selectedItem={selected}
        onSelect={setSelected}
        getItemKey={getUserKey}
        getItemDisplay={getUserDisplay}
        placeholder="Select a team member"
      >
        <DropdownTrigger
          displayValue={selected ? getUserDisplay(selected) : ''}
          placeholder="Select a team member"
          data-testid="custom-user-dropdown-trigger"
        />
        <DropdownContent data-testid="custom-user-dropdown-content">
          <div className="px-3 py-2 bg-blue-50 border-b border-blue-100 text-sm text-blue-800">
            Team Members ({filteredUsers.length})
          </div>
          <DropdownSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name or role..."
            data-testid="custom-user-dropdown-search"
          />
          <DropdownList
            items={filteredUsers}
            onSelect={setSelected}
            hasResults={filteredUsers.length > 0}
            selectedItem={selected}
            getItemKey={getUserKey}
            getItemDisplay={getUserDisplay}
            data-testid="custom-user-dropdown-list"
          />
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
            Need to add someone? Contact your admin
          </div>
        </DropdownContent>
      </DropdownRoot>
    );
  },
};

/**
 * Pre-selected user
 */
export const WithPreselection: Story = {
  render: UserTemplate,
  args: {
    selectedItem: users[0],
    placeholder: 'Select a user',
    triggerProps: { 'data-testid': 'preselected-user-trigger' },
    dropdownProps: { searchPlaceholder: 'Search by name or role...' },
  },
};
