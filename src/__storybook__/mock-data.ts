/**
 * Mock data for Dropdown component Storybook stories
 * @module dropdown/__storybook__/mock-data
 */

/**
 * Language interface for realistic language dropdown examples
 */
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  region: string;
}

/**
 * User interface for realistic user dropdown examples
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

/**
 * AI model descriptor used for grouped dropdown examples
 */
export interface AIModel {
  id: string;
  provider: 'openai' | 'google' | 'anthropic' | 'meta';
  name: string;
  description: string;
  icon: string;
}

/**
 * Simple string array for basic examples
 */
export const simpleItems = [
  'Apple',
  'Banana',
  'Cherry',
  'Date',
  'Elderberry',
  'Fig',
  'Grape',
  'Honeydew',
];

/**
 * Small list ideal for simple dropdown (no search)
 */
export const smallList = ['Red', 'Blue', 'Green', 'Yellow', 'Purple'];

/**
 * Realistic language data with native names
 */
export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'Global' },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    region: 'Europe/Americas',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    region: 'Europe/Africa',
  },
  { code: 'de', name: 'German', nativeName: 'Deutsch', region: 'Europe' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', region: 'Asia' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', region: 'Asia' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', region: 'Asia' },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    region: 'Middle East/North Africa',
  },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', region: 'Europe/Asia' },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    region: 'Europe/Americas',
  },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', region: 'Europe' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', region: 'Europe' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', region: 'Europe' },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    region: 'Middle East/Europe',
  },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', region: 'Europe' },
];

/**
 * Realistic user data for user selection examples
 */
export const users: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    role: 'Admin',
    avatar: '👩‍💼',
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    role: 'Developer',
    avatar: '👨‍💻',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    role: 'Designer',
    avatar: '👩‍🎨',
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@example.com',
    role: 'Product Manager',
    avatar: '👨‍💼',
  },
  {
    id: '5',
    name: 'Jessica Taylor',
    email: 'jessica.taylor@example.com',
    role: 'Developer',
    avatar: '👩‍💻',
  },
  {
    id: '6',
    name: 'Alex Martinez',
    email: 'alex.martinez@example.com',
    role: 'QA Engineer',
    avatar: '🧪',
  },
  {
    id: '7',
    name: 'Rachel Green',
    email: 'rachel.green@example.com',
    role: 'Marketing',
    avatar: '📊',
  },
  {
    id: '8',
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    role: 'Sales',
    avatar: '💼',
  },
];

/**
 * AI model inventory grouped by provider
 */
export const aiModels: AIModel[] = [
  {
    id: 'gpt-4o',
    provider: 'openai',
    name: 'GPT-4o',
    description: 'Balanced quality, speed, and cost for general chat.',
    icon: '🟦',
  },
  {
    id: 'gpt-4o-mini',
    provider: 'openai',
    name: 'GPT-4o mini',
    description: 'Lighter, faster variant ideal for UI interactions.',
    icon: '🟦',
  },
  {
    id: 'gemini-1.5-pro',
    provider: 'google',
    name: 'Gemini 1.5 Pro',
    description: 'Long-context reasoning with strong multimodal support.',
    icon: '🟩',
  },
  {
    id: 'gemini-1.5-flash',
    provider: 'google',
    name: 'Gemini 1.5 Flash',
    description: 'Latency optimised model for live collaboration.',
    icon: '🟩',
  },
  {
    id: 'claude-3-opus',
    provider: 'anthropic',
    name: 'Claude 3 Opus',
    description: "Anthropic's flagship with nuance and safety guardrails.",
    icon: '🟧',
  },
  {
    id: 'claude-3-sonnet',
    provider: 'anthropic',
    name: 'Claude 3 Sonnet',
    description: 'Great all-rounder with thoughtful rewording and summaries.',
    icon: '🟧',
  },
  {
    id: 'llama-3-405b',
    provider: 'meta',
    name: 'Llama 3 405B',
    description: 'Open-source foundation model for custom deployments.',
    icon: '🟪',
  },
  {
    id: 'llama-3-70b',
    provider: 'meta',
    name: 'Llama 3 70B',
    description: 'Smaller footprint without sacrificing core reasoning.',
    icon: '🟪',
  },
];

/**
 * Large dataset for performance testing
 */
export const largeDataset = Array.from({ length: 150 }, (_, i) => ({
  id: `item-${i + 1}`,
  name: `Item ${i + 1}`,
  category: `Category ${Math.floor(i / 10) + 1}`,
}));

/**
 * Helper functions for getting display values
 */
export const getLanguageKey = (lang: Language) => lang.code;
export const getLanguageDisplay = (lang: Language) => `${lang.name} (${lang.nativeName})`;

export const getUserKey = (user: User) => user.id;
export const getUserDisplay = (user: User) => `${user.name} - ${user.role}`;

export const getModelKey = (model: AIModel) => model.id;
export const getModelDisplay = (model: AIModel) => model.name;

export const getItemKey = (item: { id: string; name: string }) => item.id;
export const getItemDisplay = (item: { id: string; name: string }) => item.name;
