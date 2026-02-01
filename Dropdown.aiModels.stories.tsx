import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { createDropdownStory } from './__storybook__/story-helpers';
import { aiModels, getModelKey, getModelDisplay, type AIModel } from './__storybook__/mock-data';

type DropdownStoryArgs = {
  items?: AIModel[];
  selectedItem?: AIModel | null;
  onSelect?: (item: AIModel | null) => void;
  disabled?: boolean;
  dropdownPlacement?: 'top' | 'bottom';
  placeholder?: string;
  triggerProps?: Record<string, any>;
  dropdownProps?: Record<string, any>;
};

/**
 * AI Model dropdown stories
 *
 * Complex dropdown example showing:
 * - Grouped sections by provider
 * - Icons and descriptions
 * - Advanced composition patterns
 */
const meta: Meta<DropdownStoryArgs> = {
  title: 'Components/Dropdown/Examples/AI Models',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'AI model dropdown with provider grouping, icons, and descriptions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      description: 'Array of AI model objects',
      control: { type: 'object' },
    },
    selectedItem: {
      description: 'Currently selected model',
      control: { type: 'object' },
    },
    disabled: {
      description: 'Disable the dropdown',
      control: { type: 'boolean' },
    },
    dropdownPlacement: {
      description: 'Where the dropdown appears relative to the trigger',
      control: { type: 'select' },
      options: ['top', 'bottom'],
    },
    placeholder: {
      description: 'Placeholder text for when no model is selected',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<DropdownStoryArgs>;

const providerMeta: Record<
  AIModel['provider'],
  {
    label: string;
    description: string;
    icon: string;
  }
> = {
  openai: {
    label: 'OpenAI',
    description: 'Optimised for product-ready chat and reasoning.',
    icon: '🟦',
  },
  google: {
    label: 'Google',
    description: 'Long-context, multimodal Gemini family.',
    icon: '🟩',
  },
  anthropic: {
    label: 'Anthropic',
    description: 'Safety-first models for compliant dialogues.',
    icon: '🟧',
  },
  meta: {
    label: 'Meta',
    description: 'Open weights for custom fine-tuning at scale.',
    icon: '🟪',
  },
};

const AIModelTemplate = createDropdownStory<AIModel>({
  defaultItems: aiModels,
  getItemKey: getModelKey,
  getItemDisplay: getModelDisplay,
  getItemDescription: (model: AIModel) => model.description,
  getItemIcon: (model: AIModel) => (
    <span aria-hidden className="text-base">
      {model.icon}
    </span>
  ),
  getItemSection: (model: AIModel) => {
    const meta = providerMeta[model.provider];
    return {
      key: model.provider,
      label: meta.label,
      description: meta.description,
      icon: meta.icon,
    };
  },
});

/**
 * Basic AI model dropdown
 */
export const Basic: Story = {
  render: AIModelTemplate,
  args: {
    placeholder: 'Select an AI model',
    triggerProps: { 'data-testid': 'ai-model-trigger' },
    dropdownProps: { searchPlaceholder: 'Search by provider or capability...' },
  },
};

/**
 * AI model dropdown with preselection
 */
export const WithPreselection: Story = {
  render: AIModelTemplate,
  args: {
    selectedItem: aiModels[0],
    placeholder: 'Select an AI model',
    triggerProps: { 'data-testid': 'preselected-ai-model-trigger' },
    dropdownProps: { searchPlaceholder: 'Search by provider or capability...' },
  },
};

/**
 * AI model dropdown for usage analytics
 * Demonstrates usage in analytics context
 */
export const AnalyticsUsage: Story = {
  render: AIModelTemplate,
  args: {
    placeholder: 'Select model for usage analytics',
    triggerProps: { 'data-testid': 'analytics-ai-model-trigger' },
    dropdownProps: { searchPlaceholder: 'Find model for analytics...' },
  },
  decorators: [
    (Story) => (
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium mb-2">Analytics Context</p>
          <p className="text-xs text-gray-600">
            Select a model to view usage patterns, API costs, and response times.
          </p>
        </div>
        <Story />
      </div>
    ),
  ],
};
