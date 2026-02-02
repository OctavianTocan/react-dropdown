import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { DropdownTrigger, DropdownProvider } from "../index";
import { createMockContext } from "../__storybook__/story-helpers";

/**
 * DropdownTrigger - The button that opens/closes the dropdown
 *
 * The trigger button displays the currently selected item or a placeholder
 * and toggles the dropdown when clicked. It includes visual feedback for:
 * - Selected state
 * - Hover effects
 * - Disabled state
 * - Dropdown open/closed indicator
 *
 * ## When to Use
 * - Use as the interactive element that users click to open the dropdown
 * - Typically the first child of DropdownRoot
 * - One per dropdown (not usually composed multiple times)
 *
 * ## Accessibility
 * - Proper button semantics
 * - Aria labels for screen readers
 * - Focus visible ring on keyboard navigation
 * - Disabled state prevents interaction
 */
const meta = {
  title: "Components/Dropdown/Building Blocks/Trigger",
  component: DropdownTrigger,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Interactive button that opens and closes the dropdown. Displays selected value or placeholder.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    displayValue: {
      description: "The value to display in the trigger button",
      control: "text",
    },
    placeholder: {
      description: "Text shown when no value is selected",
      control: "text",
    },
    className: {
      description: "Additional CSS classes",
      control: "text",
    },
  },
} satisfies Meta<typeof DropdownTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Empty state with placeholder
 * Shows the default appearance with no selection
 */
export const WithPlaceholder: Story = {
  args: {
    displayValue: "",
    placeholder: "Select an option",
  },
  render: (args) => (
    <DropdownProvider value={createMockContext()}>
      <DropdownTrigger {...args} />
    </DropdownProvider>
  ),
};

/**
 * Selected state
 * Shows the trigger with a selected value displayed
 */
export const WithSelectedValue: Story = {
  args: {
    displayValue: "Apple",
    placeholder: "Select an option",
  },
  render: (args) => (
    <DropdownProvider value={createMockContext()}>
      <DropdownTrigger {...args} />
    </DropdownProvider>
  ),
};

/**
 * Disabled state
 * Shows the non-interactive disabled appearance
 */
export const Disabled: Story = {
  args: {
    displayValue: "",
    placeholder: "Dropdown disabled",
  },
  render: (args) => (
    <DropdownProvider value={createMockContext({ disabled: true })}>
      <DropdownTrigger {...args} />
    </DropdownProvider>
  ),
};

/**
 * Open state
 * Shows the trigger when the dropdown is open (visual indicator)
 */
export const OpenState: Story = {
  args: {
    displayValue: "Banana",
    placeholder: "Select a fruit",
  },
  render: (args) => (
    <DropdownProvider value={createMockContext({ isOpen: true })}>
      <DropdownTrigger {...args} />
    </DropdownProvider>
  ),
};

/**
 * Long display value
 * Shows how the trigger handles longer text that might wrap or truncate
 */
export const LongValue: Story = {
  args: {
    displayValue: "Very Long Option Name That Might Wrap Or Get Truncated",
    placeholder: "Select",
  },
  render: (args) => (
    <DropdownProvider value={createMockContext()}>
      <DropdownTrigger {...args} />
    </DropdownProvider>
  ),
};

/**
 * Custom styling
 * Shows the trigger with custom CSS classes applied
 */
export const CustomStyling: Story = {
  args: {
    displayValue: "Custom",
    placeholder: "Select an option",
    className: "bg-blue-50! text-blue-900! border-blue-300!",
  },
  render: (args) => (
    <DropdownProvider value={createMockContext()}>
      <DropdownTrigger {...args} />
    </DropdownProvider>
  ),
};

/**
 * Selected with open state
 * Shows the trigger displaying a selection while dropdown is open
 */
export const SelectedAndOpen: Story = {
  args: {
    displayValue: "Python",
    placeholder: "Select a language",
  },
  render: (args) => (
    <DropdownProvider value={createMockContext({ isOpen: true })}>
      <DropdownTrigger {...args} />
    </DropdownProvider>
  ),
};
