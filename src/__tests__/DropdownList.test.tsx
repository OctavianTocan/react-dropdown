/**
 * @file DropdownList.test.tsx
 * @brief Unit tests for DropdownList component
 */

import { vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "../test-utils/test-helpers";
import { DropdownList, DropdownProvider } from "../index";
import { createMockDropdownContext } from "../test-utils/test-helpers";
import { mockItems, getMockItemKey, getMockItemDisplay } from "../test-utils/mock-data";

describe("DropdownList", () => {
  describe("Rendering", () => {
    it("renders items", () => {
      const mockContext = createMockDropdownContext();
      const onSelect = vi.fn();

      render(
        <DropdownProvider value={mockContext}>
          <DropdownList
            items={mockItems}
            onSelect={onSelect}
            hasResults={true}
            getItemKey={getMockItemKey}
            getItemDisplay={getMockItemDisplay}
          />
        </DropdownProvider>,
      );

      expect(screen.getByText("Item One")).toBeInTheDocument();
      expect(screen.getByText("Item Two")).toBeInTheDocument();
    });

    it("shows no results message when hasResults is false", () => {
      const mockContext = createMockDropdownContext();
      const onSelect = vi.fn();

      render(
        <DropdownProvider value={mockContext}>
          <DropdownList
            items={[]}
            onSelect={onSelect}
            hasResults={false}
            getItemKey={getMockItemKey}
            getItemDisplay={getMockItemDisplay}
          />
        </DropdownProvider>,
      );

      expect(screen.getByText("No results found")).toBeInTheDocument();
    });

    it("highlights selected item", () => {
      const mockContext = createMockDropdownContext();
      const onSelect = vi.fn();

      render(
        <DropdownProvider value={mockContext}>
          <DropdownList
            items={mockItems}
            onSelect={onSelect}
            hasResults={true}
            selectedItem={mockItems[0]}
            getItemKey={getMockItemKey}
            getItemDisplay={getMockItemDisplay}
          />
        </DropdownProvider>,
      );

      const firstItem = screen.getByText("Item One").closest('[role="option"]');
      expect(firstItem).not.toBeNull();
      expect(firstItem).toHaveClass("bg-blue-50");
    });
  });

  describe("Interaction", () => {
    it("calls onSelect when item is clicked", () => {
      const mockContext = createMockDropdownContext();
      const onSelect = vi.fn();

      render(
        <DropdownProvider value={mockContext}>
          <DropdownList
            items={mockItems}
            onSelect={onSelect}
            hasResults={true}
            getItemKey={getMockItemKey}
            getItemDisplay={getMockItemDisplay}
          />
        </DropdownProvider>,
      );

      const firstItem = screen.getByText("Item One");
      fireEvent.click(firstItem);

      expect(onSelect).toHaveBeenCalledWith(mockItems[0]);
    });
  });
});
