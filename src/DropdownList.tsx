/**
 * @file DropdownList.tsx
 * @brief List component for displaying dropdown items
 */

"use client";

import { useEffect, useMemo, useRef } from "react";
import { useDropdownContext } from "./DropdownContext";
import {
  buildRenderedItems,
  groupItemsBySection,
  type DropdownListAccessors,
} from "./DropdownListItems";
import type { DropdownListProps } from "./types";

/**
 * @brief List component for displaying dropdown options
 * @description Renders a scrollable list of items with support for grouping, separators,
 * icons, descriptions, and custom styling. Handles scrolling the selected item into view
 * when the list opens and provides proper accessibility attributes. Items can be grouped
 * into sections with headers, and separators can be added between items.
 * @template T The type of items in the dropdown
 * @param props List configuration and items
 * @param props.items Array of items to display in the dropdown
 * @param props.onSelect Optional custom callback when an item is selected
 * @param props.hasResults Whether there are results to display
 * @param props.selectedItem Currently selected item
 * @param props.getItemKey Function to get unique key for each item
 * @param props.getItemDisplay Function to get display text for each item
 * @param props.renderItem Optional custom render function for items
 * @param props.getItemDescription Optional function to get description text
 * @param props.getItemIcon Optional function to get icon element
 * @param props.getItemSection Optional function to get section metadata
 * @param props.getItemSeparator Optional `(item, index) => boolean`, return true to render a divider ABOVE this item
 * @param props.getItemDisabled Optional function to determine if item is disabled
 * @param props.getItemClassName Optional function to get custom className
 * @param props.staggered Whether to use staggered animations for list items
 * @param props.staggerDelay Delay in seconds between each item animation
 * @param props.className Additional CSS classes for the list container
 * @param props['data-testid'] Test ID for the list element
 * @returns JSX element for the item list
 */
export function DropdownList<T>({
  items,
  onSelect: customOnSelect,
  hasResults,
  selectedItem,
  getItemKey,
  getItemDisplay,
  renderItem,
  getItemDescription,
  getItemIcon,
  getItemSection,
  getItemSeparator,
  getItemDisabled,
  getItemClassName,
  staggered = false,
  staggerDelay = 0.04,
  className = "",
  focusedIndex,
  getItemId,
  onItemPointerEnter,
  "data-testid": testId = "dropdown-list",
}: DropdownListProps<T>) {
  const {
    isOpen,
    getItemDescription: contextDescription,
    getItemIcon: contextIcon,
    getItemSection: contextSection,
    getItemSeparator: contextSeparator,
    getItemDisabled: contextDisabled,
    getItemClassName: contextClassName,
    onSelect: contextOnSelect,
    closeDropdown,
    closeOnSelect,
    computedPlacement,
    enterDuration,
  } = useDropdownContext<T>();
  /** @brief Ref to the list element for scrolling and DOM queries */
  const listRef = useRef<HTMLUListElement>(null);
  const selectedItemKey = selectedItem ? getItemKey(selectedItem) : null;

  /**
   * @brief Tracks previous open state to detect transitions
   * @description Used to determine when the dropdown transitions from closed to open,
   * which triggers scrolling the selected item into view.
   */
  const prevIsOpenRef = useRef(isOpen);

  /**
   * @brief Scrolls selected item into view when dropdown opens
   * @description Only scrolls when transitioning from closed to open state to avoid
   * unnecessary scrolling when the dropdown is already open and items change.
   */
  useEffect(() => {
    // Only scroll when transitioning from closed to open
    if (isOpen && !prevIsOpenRef.current && listRef.current && selectedItemKey) {
      const selectedElement = listRef.current.querySelector(`[data-key="${selectedItemKey}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "auto",
          block: "start",
        });
      }
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, selectedItemKey]);

  /**
   * @brief Accessor function to retrieve description text for an item
   * @description Resolves getItemDescription from props or context. Returns the description
   * text that appears beneath the primary label for each dropdown item, or null/undefined
   * if no description is available.
   */
  const descriptionAccessor = getItemDescription ?? contextDescription;
  /**
   * @brief Accessor function to retrieve icon element for an item
   * @description Resolves getItemIcon from props or context. Returns a React node (typically
   * an icon component) that is rendered before the label for each dropdown item, or undefined
   * if no icon is available.
   */
  const iconAccessor = getItemIcon ?? contextIcon;
  /**
   * @brief Accessor function to retrieve section metadata for an item
   * @description Resolves getItemSection from props or context. Returns section metadata
   * (key, label, icon, description) that groups items under labeled section headers, or
   * null/undefined if the item is not part of a section.
   */
  const sectionAccessor = getItemSection ?? contextSection;
  /**
   * @brief Accessor function to determine if a separator should be shown
   * BEFORE an item
   * @description Resolves getItemSeparator from props or context. Called with
   * `(item, index)` and should return true if a divider should appear ABOVE
   * the item, useful for marking the start of an "advanced" or "destructive"
   * group at the bottom of a menu. The renderer suppresses the divider when
   * it would land at the very top of the list (or the top of a section).
   */
  const separatorAccessor = getItemSeparator ?? contextSeparator;
  /**
   * @brief Accessor function to determine if an item is disabled
   * @description Resolves getItemDisabled from props or context. Returns true if the item
   * should be disabled (non-clickable and visually dimmed), false otherwise.
   */
  const disabledAccessor = getItemDisabled ?? contextDisabled;
  /**
   * @brief Accessor function to retrieve custom className for an item
   * @description Resolves getItemClassName from props or context. Returns a custom CSS class
   * string that is applied to each dropdown item, allowing for custom styling based on the
   * item's state (selected, disabled) and properties.
   */
  const classNameAccessor = getItemClassName ?? contextClassName;

  /**
   * @brief Memoized grouped items organized by section
   * @description Groups items into sections and ungrouped items based on section metadata.
   * Recomputes when items or section accessor changes.
   */
  const groupedItems = useMemo(() => groupItemsBySection(items, sectionAccessor), [items, sectionAccessor]);

  /**
   * @brief Resolved onSelect handler with dropdown closing logic
   * @description Combines custom onSelect handler (if provided) with context handler,
   * and ensures the dropdown closes after selection if closeOnSelect is enabled.
   * Memoized to prevent unnecessary re-renders.
   * @returns Function that handles item selection and dropdown closing
   */
  const resolvedOnSelect = useMemo(() => {
    const selectHandler = customOnSelect || contextOnSelect;

    return (item: T) => {
      selectHandler(item);
      // Close dropdown after selection if enabled
      if (closeOnSelect) {
        closeDropdown();
      }
    };
  }, [customOnSelect, contextOnSelect, closeOnSelect, closeDropdown]);

  /**
   * @brief Renders empty state when no results are available
   * @description Shows a "No results found" message when hasResults is false.
   */
  if (!hasResults) {
    return <div className={`p-4 text-center text-sm text-zinc-500 ${className}`}>No results found</div>;
  }

  const accessors: DropdownListAccessors<T> = {
    description: descriptionAccessor,
    icon: iconAccessor,
    separator: separatorAccessor,
    disabled: disabledAccessor,
    className: classNameAccessor,
  };
  const finalItems = buildRenderedItems({
    items,
    groupedItems,
    selectedItemKey,
    getItemKey,
    getItemDisplay,
    renderItem,
    accessors,
    onSelect: resolvedOnSelect,
    focusedIndex,
    getItemId,
    onItemPointerEnter,
    computedPlacement,
    enterDuration,
    staggerDelay,
    staggered,
  });

  return (
    <ul
      ref={listRef}
      className={`overflow-y-auto flex-1 min-h-0 flex flex-col no-scrollbar ${className}`}
      role="listbox"
      data-testid={testId}
    >
      {finalItems}
    </ul>
  );
}
