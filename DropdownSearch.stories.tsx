import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
  DropdownRoot,
  DropdownTrigger,
  DropdownContent,
  DropdownSearch,
  DropdownList,
} from './index';
import {
  simpleItems,
  languages,
  getLanguageKey,
  getLanguageDisplay,
  type Language,
} from './__storybook__/mock-data';

/**
 * DropdownSearch - Search input for filtering dropdown items
 *
 * Standalone search input component that filters items as you type.
 * Use this for custom compositions where you need search but want
 * control over the layout.
 *
 * ## When to Use
 * - Custom dropdown compositions
 * - When you need search in a non-standard layout
 * - Advanced use cases requiring fine-grained control
 *
 * ## When Not to Use
 * - Standard dropdowns - use DropdownSearchable instead
 * - Non-searchable lists - use DropdownSimple instead
 *
 * ## Features
 * - Real-time filtering as you type
 * - Auto-focuses when dropdown opens
 * - Tab key is captured to prevent leaving input
 * - Integrates with DropdownRoot's filter function
 * - Shows focus ring on keyboard navigation
 */
const meta = {
  title: 'Components/Dropdown/Building Blocks/Search',
  component: DropdownSearch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Standalone search input for filtering dropdown items. Use for custom compositions requiring search functionality.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      description: 'Placeholder text for the search input',
      control: 'text',
    },
  },
} satisfies Meta<typeof DropdownSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicSearch: Story = {
  args: {
    value: '',
    onChange: () => {},
    placeholder: 'Search fruits...',
  },
  render: function BasicSearchStory(args) {
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
      >
        <DropdownTrigger displayValue={selected ?? ''} placeholder="Select a fruit" />
        <DropdownContent>
          <DropdownSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={args.placeholder}
          />
          <DropdownList
            items={filteredItems}
            onSelect={setSelected}
            hasResults={filteredItems.length > 0}
            selectedItem={selected}
            getItemKey={(item: string) => item}
            getItemDisplay={(item: string) => item}
          />
        </DropdownContent>
      </DropdownRoot>
    );
  },
};

/**
 * Search with complex objects
 * Shows filtering of objects like languages
 */
export const SearchComplexObjects: Story = {
  args: {
    value: '',
    onChange: () => {},
    placeholder: 'Search by language name or code...',
  },
  render: function SearchComplexObjectsStory(args) {
    const [selected, setSelected] = React.useState<Language | null>(null);
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredLanguages = languages.filter((lang) =>
      getLanguageDisplay(lang).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <DropdownRoot
        items={filteredLanguages}
        selectedItem={selected}
        onSelect={setSelected}
        getItemKey={getLanguageKey}
        getItemDisplay={getLanguageDisplay}
      >
        <DropdownTrigger
          displayValue={selected ? getLanguageDisplay(selected) : ''}
          placeholder="Select a language"
        />
        <DropdownContent>
          <DropdownSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={args.placeholder}
          />
          <DropdownList
            items={filteredLanguages}
            onSelect={setSelected}
            hasResults={filteredLanguages.length > 0}
            selectedItem={selected}
            getItemKey={getLanguageKey}
            getItemDisplay={getLanguageDisplay}
          />
        </DropdownContent>
      </DropdownRoot>
    );
  },
};

/**
 * Search with custom placeholder
 * Demonstrates customized search prompt
 */
export const CustomPlaceholder: Story = {
  args: {
    value: '',
    onChange: () => {},
    placeholder: 'Type to filter options...',
  },
  render: function CustomPlaceholderStory(args) {
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
      >
        <DropdownTrigger displayValue={selected ?? ''} placeholder="Pick one" />
        <DropdownContent>
          <DropdownSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={args.placeholder}
          />
          <DropdownList
            items={filteredItems}
            onSelect={setSelected}
            hasResults={filteredItems.length > 0}
            selectedItem={selected}
            getItemKey={(item: string) => item}
            getItemDisplay={(item: string) => item}
          />
        </DropdownContent>
      </DropdownRoot>
    );
  },
};

/**
 * Search in header section
 * Shows search inside custom header composition
 */
export const SearchWithHeader: Story = {
  args: {
    value: '',
    onChange: () => {},
    placeholder: 'Filter items...',
  },
  render: function SearchWithHeaderStory(args) {
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
      >
        <DropdownTrigger displayValue={selected ?? ''} placeholder="Pick a fruit" />
        <DropdownContent>
          <div className="px-3 py-2 bg-blue-50 border-b text-sm font-medium text-blue-900">
            Available Fruits
          </div>
          <DropdownSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={args.placeholder}
          />
          <DropdownList
            items={filteredItems}
            onSelect={setSelected}
            hasResults={filteredItems.length > 0}
            selectedItem={selected}
            getItemKey={(item: string) => item}
            getItemDisplay={(item: string) => item}
          />
        </DropdownContent>
      </DropdownRoot>
    );
  },
};

/**
 * Search with footer section
 * Shows search in full custom layout
 */
export const SearchWithFooter: Story = {
  args: {
    value: '',
    onChange: () => {},
    placeholder: 'Search fruits...',
  },
  render: function SearchWithFooterStory(args) {
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
      >
        <DropdownTrigger displayValue={selected ?? ''} placeholder="Pick a fruit" />
        <DropdownContent>
          <DropdownSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={args.placeholder}
          />
          <DropdownList
            items={filteredItems}
            onSelect={setSelected}
            hasResults={filteredItems.length > 0}
            selectedItem={selected}
            getItemKey={(item: string) => item}
            getItemDisplay={(item: string) => item}
          />
          <div className="px-3 py-2 bg-gray-50 border-t text-xs text-gray-600">
            Can&apos;t find what you&apos;re looking for? Contact support
          </div>
        </DropdownContent>
      </DropdownRoot>
    );
  },
};

/**
 * Search positioned below list
 * Shows search in non-standard position (bottom)
 */
export const SearchBelow: Story = {
  args: {
    value: '',
    onChange: () => {},
    placeholder: 'Search fruits...',
  },
  render: function SearchBelowStory(args) {
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
      >
        <DropdownTrigger displayValue={selected ?? ''} placeholder="Pick a fruit" />
        <DropdownContent>
          <DropdownList
            items={filteredItems}
            onSelect={setSelected}
            hasResults={filteredItems.length > 0}
            selectedItem={selected}
            getItemKey={(item: string) => item}
            getItemDisplay={(item: string) => item}
          />
          <div className="border-t">
            <DropdownSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={args.placeholder}
            />
          </div>
        </DropdownContent>
      </DropdownRoot>
    );
  },
};
