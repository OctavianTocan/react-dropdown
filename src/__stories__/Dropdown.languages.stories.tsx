import type { Meta, StoryObj } from "@storybook/react";
import { createDropdownStory, dropdownRootArgTypes } from "../__storybook__/story-helpers";
import { languages, getLanguageKey, getLanguageDisplay, type Language } from "../__storybook__/mock-data";

type DropdownStoryArgs = {
  items?: Language[];
  selectedItem?: Language | null;
  onSelect?: (item: Language | null) => void;
  disabled?: boolean;
  dropdownPlacement?: "top" | "bottom";
  placeholder?: string;
  triggerProps?: Record<string, unknown>;
  dropdownProps?: Record<string, unknown>;
};

/**
 * Language dropdown stories
 *
 * Real-world examples using language data with native names and regions.
 * Demonstrates handling of complex objects with multiple display properties.
 */
const meta: Meta<DropdownStoryArgs> = {
  title: "Components/Dropdown/Examples/Languages",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Language dropdown with native names and regional information.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: dropdownRootArgTypes,
};

export default meta;
type Story = StoryObj<DropdownStoryArgs>;

const LanguageTemplate = createDropdownStory<Language>({
  defaultItems: languages,
  getItemKey: getLanguageKey,
  getItemDisplay: getLanguageDisplay,
});

/**
 * Basic language dropdown
 */
export const Basic: Story = {
  render: LanguageTemplate,
  args: {
    placeholder: "Select a language",
    triggerProps: { "data-testid": "language-dropdown-trigger" },
    dropdownProps: { searchPlaceholder: "Search languages..." },
  },
};

/**
 * Pre-selected language
 */
export const WithPreselection: Story = {
  render: LanguageTemplate,
  args: {
    selectedItem: languages[0],
    placeholder: "Select a language",
    triggerProps: { "data-testid": "preselected-language-trigger" },
    dropdownProps: { searchPlaceholder: "Search languages..." },
  },
};

/**
 * Language dropdown with custom filtering
 */
export const WithCustomFilter: Story = {
  render: function WithCustomFilterStory(args) {
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
    placeholder: "Select a language",
    triggerProps: { "data-testid": "filtered-language-trigger" },
    dropdownProps: {
      searchPlaceholder: "Search by name, native name, or region...",
    },
  },
};
