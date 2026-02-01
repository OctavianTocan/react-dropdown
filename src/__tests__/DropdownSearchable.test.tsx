/**
 * @file DropdownSearchable.test.tsx
 * @brief Unit tests for DropdownSearchable component
 */

import { vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "../test-utils/test-helpers";
import { DropdownSearchable, DropdownProvider } from "../index";
import { createMockDropdownContext } from "../test-utils/test-helpers";
import { mockItems, getMockItemKey, getMockItemDisplay } from "../test-utils/mock-data";

describe("DropdownSearchable", () => {
  describe("Rendering", () => {
    it("renders search input and list", () => {
      const mockContext = createMockDropdownContext({
        isOpen: true,
        items: mockItems,
        filteredItems: mockItems,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
      });
      render(
        <DropdownProvider value={mockContext}>
          <DropdownSearchable />
        </DropdownProvider>,
      );

      expect(screen.getByTestId("dropdown-search")).toBeInTheDocument();
      expect(screen.getByTestId("dropdown-list")).toBeInTheDocument();
    });

    it("uses custom search placeholder", () => {
      const mockContext = createMockDropdownContext({ isOpen: true });
      render(
        <DropdownProvider value={mockContext}>
          <DropdownSearchable searchPlaceholder="Type to search..." />
        </DropdownProvider>,
      );

      expect(screen.getByPlaceholderText("Type to search...")).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("filters items as user types", async () => {
      const mockSetSearchQuery = vi.fn();
      const mockContext = createMockDropdownContext({
        isOpen: true,
        items: mockItems,
        filteredItems: mockItems,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        setSearchQuery: mockSetSearchQuery,
      });

      render(
        <DropdownProvider value={mockContext}>
          <DropdownSearchable />
        </DropdownProvider>,
      );

      const searchInput = screen.getByTestId("dropdown-search");
      fireEvent.change(searchInput, { target: { value: "One" } });

      await waitFor(() => {
        expect(mockSetSearchQuery).toHaveBeenCalledWith("One");
      });
    });
  });
});
