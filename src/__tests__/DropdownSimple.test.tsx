/**
 * @file DropdownSimple.test.tsx
 * @brief Unit tests for DropdownSimple component
 */

import React from "react";
import { render, screen } from "../test-utils/test-helpers";
import { DropdownSimple, DropdownProvider } from "../index";
import { createMockDropdownContext } from "../test-utils/test-helpers";
import { mockItems, getMockItemKey, getMockItemDisplay, type MockItem } from "../test-utils/mock-data";

describe("DropdownSimple", () => {
  describe("Rendering", () => {
    it("renders list without search", () => {
      const mockContext = createMockDropdownContext<MockItem>({
        isOpen: true,
        items: mockItems,
        filteredItems: mockItems,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
      });

      render(
        <DropdownProvider value={mockContext}>
          <DropdownSimple />
        </DropdownProvider>
      );

      expect(screen.queryByTestId("dropdown-search")).not.toBeInTheDocument();
      expect(screen.getByTestId("dropdown-list")).toBeInTheDocument();
    });

    it("renders items in list", () => {
      const mockContext = createMockDropdownContext<MockItem>({
        isOpen: true,
        items: mockItems,
        filteredItems: mockItems,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
      });

      render(
        <DropdownProvider value={mockContext}>
          <DropdownSimple />
        </DropdownProvider>
      );

      expect(screen.getByText("Item One")).toBeInTheDocument();
      expect(screen.getByText("Item Two")).toBeInTheDocument();
    });
  });
});
