/**
 * @file mock-data.ts
 * @brief Shared mock datasets for dropdown tests
 */

// --- ITEM MOCKS --- //
// WHY: Consistent test data ensures deterministic behaviour across suites.
export interface MockItem {
  id: string;
  name: string;
  value: number;
}

export const mockItems: MockItem[] = [
  { id: "1", name: "Item One", value: 1 },
  { id: "2", name: "Item Two", value: 2 },
  { id: "3", name: "Item Three", value: 3 },
  { id: "4", name: "Item Four", value: 4 },
  { id: "5", name: "Item Five", value: 5 },
];

// --- LANGUAGE MOCKS --- //
// WHY: Language specific tests require additional metadata like native names.
export interface MockLanguage {
  code: string;
  name: string;
  nativeName: string;
}

export const mockLanguages: MockLanguage[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
];

// --- EDGE CASE DATASETS --- //
// WHY: Dedicated arrays simplify edge case assertions (empty, single, large sets).
export const emptyItems: MockItem[] = [];
export const emptyLanguages: MockLanguage[] = [];

export const singleItem: MockItem[] = [mockItems[0]];
export const singleLanguage: MockLanguage[] = [mockLanguages[0]];

export const largeItemSet: MockItem[] = Array.from({ length: 100 }, (_, index) => ({
  id: `item-${index + 1}`,
  name: `Item ${index + 1}`,
  value: index + 1,
}));

export const specialCharItems: MockItem[] = [
  { id: "special-1", name: "Item with & ampersand", value: 1 },
  { id: "special-2", name: "Item with <angle> brackets", value: 2 },
  { id: "special-3", name: 'Item with "quotes"', value: 3 },
  { id: "special-4", name: "Item with 'single quotes'", value: 4 },
  { id: "special-5", name: "Item with émojis 🎉", value: 5 },
];

// --- HELPERS --- //
// WHY: Utility functions keep test data transformations DRY and intention revealing.
import { vi } from "vitest";

export const getMockItemKey = (item: MockItem) => item.id;
export const getMockItemDisplay = (item: MockItem) => item.name;

export const getMockLanguageKey = (language: MockLanguage) => language.code;
export const getMockLanguageDisplay = (language: MockLanguage) => language.name;

export const createMockOnSelect = <T>() => {
  const mock = vi.fn<(item: T) => void>();
  return { mock };
};
export const createMockFilterItems = <T>() => vi.fn((items: T[], _query: string) => items);
