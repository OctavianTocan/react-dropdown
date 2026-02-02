import type { Meta, StoryObj } from "@storybook/react";
import { createDropdownStory } from "../__storybook__/story-helpers";
import { smallList } from "../__storybook__/mock-data";

type DropdownStoryArgs = {
  items?: string[];
  selectedItem?: string | null;
  onSelect?: (item: string | null) => void;
  disabled?: boolean;
  dropdownPlacement?: "top" | "bottom";
  placeholder?: string;
  triggerProps?: Record<string, unknown>;
  dropdownProps?: Record<string, unknown>;
};

/**
 * DropdownSimple - Pre-made simple dropdown (no search)
 *
 * A pre-built dropdown with just the item list, no search functionality.
 * Perfect for small, focused lists where search would be unnecessary.
 *
 * ## When to Use
 * - Small lists (under 10-15 items)
 * - Simple selections like status, priority, or color
 * - When the user can easily scan all options
 * - Mobile-friendly scenarios where typing is less convenient
 *
 * ## When Not to Use
 * - Large lists (15+ items) - use DropdownSearchable instead
 * - When users need to filter/search through options
 * - Dynamic lists that might grow over time
 *
 * ## Features
 * - Clean, minimal interface
 * - Quick selection without search overhead
 * - Keyboard navigation support
 * - Perfect for small, static lists
 */
const meta: Meta<DropdownStoryArgs> = {
  title: "Components/Dropdown/Prebuilt/Simple",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Pre-made simple dropdown with just the item list. Recommended for small lists (under 10-15 items) where search is unnecessary.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<DropdownStoryArgs>;

const SimpleDropdownTemplate = createDropdownStory<string>({
  defaultItems: smallList,
  getItemKey: (item: string) => item,
  getItemDisplay: (item: string) => item,
});

const PriorityTemplate = createDropdownStory<string>({
  defaultItems: ["Critical", "High", "Medium", "Low", "Trivial"],
  getItemKey: (item: string) => item,
  getItemDisplay: (item: string) => item,
});

const StatusTemplate = createDropdownStory<string>({
  defaultItems: ["Backlog", "Todo", "In Progress", "In Review", "Done", "Blocked"],
  getItemKey: (item: string) => item,
  getItemDisplay: (item: string) => item,
});

const SizeTemplate = createDropdownStory<string>({
  defaultItems: ["XS", "Small", "Medium", "Large", "XL", "2XL"],
  getItemKey: (item: string) => item,
  getItemDisplay: (item: string) => item,
});

/**
 * Default simple dropdown
 * Basic implementation for small lists
 */
export const Default: Story = {
  render: SimpleDropdownTemplate,
  args: {
    placeholder: "Select a color",
    triggerProps: { "data-testid": "simple-trigger" },
  },
};

/**
 * Small list use case
 * Ideal scenario for simple dropdown - 5-10 items
 */
export const SmallList: Story = {
  render: PriorityTemplate,
  args: {
    placeholder: "Select priority",
    triggerProps: { "data-testid": "small-list-trigger" },
  },
};

/**
 * With pre-selected item
 * Shows dropdown with an initial selection highlighted
 */
export const WithSelection: Story = {
  render: SimpleDropdownTemplate,
  args: {
    selectedItem: smallList[2],
    placeholder: "Select a color",
    triggerProps: { "data-testid": "with-selection-trigger" },
  },
};

/**
 * Status selector example
 * Real-world use case for task/issue status
 */
export const StatusSelector: Story = {
  render: StatusTemplate,
  args: {
    placeholder: "Select status",
    triggerProps: { "data-testid": "status-trigger" },
  },
};

/**
 * Size selector example
 * Another common use case for simple dropdown
 */
export const SizeSelectorExample: Story = {
  render: SizeTemplate,
  args: {
    placeholder: "Select size",
    triggerProps: { "data-testid": "size-trigger" },
  },
};

/**
 * Disabled state
 * Shows non-interactive disabled dropdown
 */
export const DisabledState: Story = {
  render: SimpleDropdownTemplate,
  args: {
    disabled: true,
    placeholder: "Disabled selector",
    triggerProps: { "data-testid": "disabled-trigger" },
  },
};
