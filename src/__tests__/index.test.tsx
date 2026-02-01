/**
 * @file index.test.tsx
 * @brief Unit tests for dropdown module exports
 */

import { vi } from "vitest";
import Dropdown from "../index";
import type { BaseDropdownProps, DropdownRootProps, DropdownTriggerProps, DropdownContextValue } from "../types";
import { mockItems, getMockItemKey, getMockItemDisplay } from "../test-utils/mock-data";
import * as dropdownModule from "../index";

describe("Dropdown Module Exports", () => {
  describe("Default Export (Compound Component)", () => {
    it("exports compound Dropdown component", () => {
      expect(Dropdown).toBeDefined();
      expect(typeof Dropdown).toBe("object");
    });

    it("includes Root component", () => {
      expect(Dropdown.Root).toBeDefined();
      expect(typeof Dropdown.Root).toBe("function");
    });

    it("includes Trigger component", () => {
      expect(Dropdown.Trigger).toBeDefined();
      expect(typeof Dropdown.Trigger).toBe("function");
    });

    it("includes Content component", () => {
      expect(Dropdown.Content).toBeDefined();
      expect(typeof Dropdown.Content).toBe("function");
    });

    it("includes Search component", () => {
      expect(Dropdown.Search).toBeDefined();
      expect(typeof Dropdown.Search).toBe("function");
    });

    it("includes List component", () => {
      expect(Dropdown.List).toBeDefined();
      expect(typeof Dropdown.List).toBe("function");
    });

    it("includes Searchable component", () => {
      expect(Dropdown.Searchable).toBeDefined();
      expect(typeof Dropdown.Searchable).toBe("function");
    });

    it("includes Simple component", () => {
      expect(Dropdown.Simple).toBeDefined();
      expect(typeof Dropdown.Simple).toBe("function");
    });
  });

  describe("Named Exports", () => {
    it("exports DropdownRoot as named export", () => {
      const { DropdownRoot } = dropdownModule;
      expect(DropdownRoot).toBeDefined();
      expect(typeof DropdownRoot).toBe("function");
    });

    it("exports DropdownTrigger as named export", () => {
      const { DropdownTrigger } = dropdownModule;
      expect(DropdownTrigger).toBeDefined();
      expect(typeof DropdownTrigger).toBe("function");
    });

    it("exports DropdownContent as named export", () => {
      const { DropdownContent } = dropdownModule;
      expect(DropdownContent).toBeDefined();
      expect(typeof DropdownContent).toBe("function");
    });

    it("exports DropdownSearch as named export", () => {
      const { DropdownSearch } = dropdownModule;
      expect(DropdownSearch).toBeDefined();
      expect(typeof DropdownSearch).toBe("function");
    });

    it("exports DropdownList as named export", () => {
      const { DropdownList } = dropdownModule;
      expect(DropdownList).toBeDefined();
      expect(typeof DropdownList).toBe("function");
    });

    it("exports DropdownSearchable as named export", () => {
      const { DropdownSearchable } = dropdownModule;
      expect(DropdownSearchable).toBeDefined();
      expect(typeof DropdownSearchable).toBe("function");
    });

    it("exports DropdownSimple as named export", () => {
      const { DropdownSimple } = dropdownModule;
      expect(DropdownSimple).toBeDefined();
      expect(typeof DropdownSimple).toBe("function");
    });
  });

  describe("Hook Exports", () => {
    it("exports useDropdownContext hook", () => {
      const { useDropdownContext } = dropdownModule;
      expect(useDropdownContext).toBeDefined();
      expect(typeof useDropdownContext).toBe("function");
    });

    it("exports useKeyboardNavigation hook", () => {
      const { useKeyboardNavigation } = dropdownModule;
      expect(useKeyboardNavigation).toBeDefined();
      expect(typeof useKeyboardNavigation).toBe("function");
    });

    it("exports useClickOutside hook", () => {
      const { useClickOutside } = dropdownModule;
      expect(useClickOutside).toBeDefined();
      expect(typeof useClickOutside).toBe("function");
    });
  });

  describe("Type Exports", () => {
    type MockItem = (typeof mockItems)[number];

    it("allows constructing BaseDropdownProps objects", () => {
      const props: BaseDropdownProps = {
        className: "custom-class",
        "data-testid": "base-props",
      };

      expect(props.className).toBe("custom-class");
    });

    it("supports DropdownRootProps for typed items", () => {
      const onSelect = vi.fn();
      const rootProps: DropdownRootProps<MockItem> = {
        items: mockItems,
        onSelect,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
      };

      expect(rootProps.items).toHaveLength(mockItems.length);
      rootProps.onSelect(mockItems[0]);
      expect(onSelect).toHaveBeenCalledWith(mockItems[0]);
    });

    it("provides DropdownTriggerProps typing for triggers", () => {
      const triggerProps: DropdownTriggerProps = {
        displayValue: "Selected value",
        placeholder: "Choose item",
        className: "trigger-class",
      };

      expect(triggerProps.placeholder).toBe("Choose item");
    });

    it("describes DropdownContextValue structure", () => {
      const contextValue: DropdownContextValue<MockItem> = {
        isOpen: false,
        setIsOpen: () => undefined,
        selectedItem: null,
        setSelectedItem: () => undefined,
        searchQuery: "",
        setSearchQuery: () => undefined,
        items: mockItems,
        filteredItems: mockItems,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        filterItems: (items) => items,
        onSelect: () => undefined,
        disabled: false,
        closeDropdown: () => undefined,
        toggleDropdown: () => undefined,
      };

      expect(contextValue.items).toEqual(mockItems);
    });
  });

  describe("Export Consistency", () => {
    it("default export matches named exports", () => {
      const namedExports = dropdownModule;
      expect(Dropdown.Root).toBe(namedExports.DropdownRoot);
      expect(Dropdown.Trigger).toBe(namedExports.DropdownTrigger);
      expect(Dropdown.Content).toBe(namedExports.DropdownContent);
    });

    it("all components are properly exported", () => {
      const allExports = Object.keys(dropdownModule);
      expect(allExports).toContain("DropdownRoot");
      expect(allExports).toContain("DropdownTrigger");
      expect(allExports).toContain("DropdownContent");
      expect(allExports).toContain("DropdownSearch");
      expect(allExports).toContain("DropdownList");
      expect(allExports).toContain("DropdownSearchable");
      expect(allExports).toContain("DropdownSimple");
      expect(allExports).toContain("useDropdownContext");
      expect(allExports).toContain("useKeyboardNavigation");
      expect(allExports).toContain("useClickOutside");
    });
  });
});
