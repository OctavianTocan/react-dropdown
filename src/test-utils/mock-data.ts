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

// --- HELPERS --- //
// WHY: Utility functions keep test data transformations DRY and intention revealing.
import { vi } from "vitest";

export const getMockItemKey = (item: MockItem) => item.id;
export const getMockItemDisplay = (item: MockItem) => item.name;

export const createMockOnSelect = <T>() => {
  const mock = vi.fn<(item: T) => void>();
  return { mock };
};
