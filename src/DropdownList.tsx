/**
 * @file DropdownList.tsx
 * @brief List component for displaying dropdown items
 */

"use client";

import React, { useRef, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useDropdownContext } from "./DropdownContext";
import type { DropdownListProps, DropdownSectionMeta } from "./types";

/**
 * @brief Container for a section of grouped items
 * @description Holds the section metadata and the items that belong to that section.
 * @template T The type of items in the dropdown
 */
interface SectionBucket<T> {
  /** Section metadata containing key, label, icon, and description */
  meta: DropdownSectionMeta;
  /** Array of items belonging to this section */
  items: T[];
}

/**
 * @brief Result of grouping items by section
 * @description Contains items organized into sections and ungrouped items that don't
 * belong to any section.
 * @template T The type of items in the dropdown
 */
interface GroupedItems<T> {
  /** Array of section buckets, each containing section metadata and its items */
  sections: SectionBucket<T>[];
  /** Array of items that don't belong to any section */
  ungrouped: T[];
}

/**
 * @brief Groups items into ordered buckets keyed by the provided section metadata
 * @description Organizes items into sections based on their section metadata while
 * preserving the original array order. Items without section metadata are placed in
 * the ungrouped array. This allows rendering grouped headers without mutating the
 * original array order.
 * @template T The type of items in the dropdown
 * @param items Array of items to group
 * @param resolveSection Optional function to extract section metadata from an item
 * @returns Object containing sections array and ungrouped items array
 */
const groupItemsBySection = <T,>(
  items: T[],
  resolveSection?: (item: T) => DropdownSectionMeta | null | undefined
): GroupedItems<T> => {
  if (!resolveSection) {
    return { sections: [], ungrouped: items };
  }

  const sectionIndex = new Map<string, number>();
  const sections: SectionBucket<T>[] = [];
  const ungrouped: T[] = [];

  items.forEach((item) => {
    const section = resolveSection(item);

    if (!section) {
      ungrouped.push(item);
      return;
    }

    const existingIndex = sectionIndex.get(section.key);

    if (existingIndex === undefined) {
      sectionIndex.set(section.key, sections.length);
      sections.push({ meta: section, items: [item] });
      return;
    }

    sections[existingIndex].items.push(item);
  });

  return { sections, ungrouped };
};

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
 * @param props.getItemSeparator Optional function to determine if separator should appear
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
    if (isOpen && !prevIsOpenRef.current && listRef.current && selectedItem) {
      const selectedElement = listRef.current.querySelector(`[data-key="${getItemKey(selectedItem)}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "auto",
          block: "start",
        });
      }
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, selectedItem, getItemKey]);

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
   * @brief Accessor function to determine if a separator should be shown after an item
   * @description Resolves getItemSeparator from props or context. This function is called
   * with (item, index) and should return true if a separator should appear after the item.
   * Typically used to add separators between all items except the last one.
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
   * @brief Resolves description text for an item
   * @description Safely retrieves the description text for an item using the description
   * accessor, returning null if no accessor is available or the accessor returns null/undefined.
   * @param item The item to get the description for
   * @returns Description text or null if not available
   */
  const resolveDescription = (item: T) => {
    if (!descriptionAccessor) {
      return null;
    }

    return descriptionAccessor(item) ?? null;
  };

  /**
   * @brief Resolves icon element for an item
   * @description Safely retrieves the icon element for an item using the icon accessor,
   * returning undefined if no accessor is available or the accessor returns undefined.
   * @param item The item to get the icon for
   * @returns Icon element (ReactNode) or undefined if not available
   */
  const resolveIcon = (item: T) => {
    if (!iconAccessor) {
      return undefined;
    }

    return iconAccessor(item);
  };

  /**
   * @brief Renders a section header for grouped items
   * @description Creates a list item with section metadata (label, icon, description)
   * that serves as a header for a group of related items.
   * @param section Section bucket containing metadata and items
   * @param index The index of this element for stagger animation
   * @returns JSX element for the section header
   */
  const renderSectionHeader = (section: SectionBucket<T>, index: number) => {
    const content = (
      <li
        key={`section-${section.meta.key}`}
        role="presentation"
        className="px-3 py-2 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {section.meta.icon && (
              <span className="text-base text-gray-500" aria-hidden>
                {section.meta.icon}
              </span>
            )}
            <span>{section.meta.label}</span>
          </div>
          {section.meta.description && (
            <span className="text-[11px] font-normal normal-case text-gray-400">{section.meta.description}</span>
          )}
        </div>
      </li>
    );

    if (staggered) {
      return (
        <motion.div
          key={`section-wrapper-${section.meta.key}`}
          initial={{ opacity: 0, y: computedPlacement === "top" ? -10 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: enterDuration * 0.5,
            delay: index * staggerDelay,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {content}
        </motion.div>
      );
    }

    return content;
  };

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
   * @brief Renders a single dropdown option item
   * @description Creates a list item containing either a custom rendered item or the
   * default DropdownOption component. Handles selection state, disabled state, and
   * custom styling.
   * @param item The item to render
   * @param index The index of this element for stagger animation
   * @returns JSX element for the option (wrapped in li)
   */
  const renderOption = (item: T, index: number) => {
    const key = getItemKey(item);
    const displayText = getItemDisplay(item);
    const isSelected = selectedItem ? getItemKey(selectedItem) === key : false;
    const isDisabled = disabledAccessor ? disabledAccessor(item) : false;
    const customClassName = classNameAccessor ? classNameAccessor(item, isSelected, isDisabled) : "";

    const optionContent = renderItem ? (
      <li key={key} data-key={key}>
        {renderItem(item, isSelected, resolvedOnSelect)}
      </li>
    ) : (
      <li key={key} data-key={key}>
        <DropdownOption
          dataKey={key}
          item={item}
          onSelect={resolvedOnSelect}
          isSelected={isSelected}
          displayText={displayText}
          description={resolveDescription(item)}
          icon={resolveIcon(item)}
          isDisabled={isDisabled}
          className={customClassName}
        />
      </li>
    );

    if (staggered) {
      return (
        <motion.div
          key={`motion-${key}`}
          initial={{ opacity: 0, y: computedPlacement === "top" ? -10 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: enterDuration * 0.5,
            delay: index * staggerDelay,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {optionContent}
        </motion.div>
      );
    }

    return optionContent;
  };

  /**
   * @brief Renders empty state when no results are available
   * @description Shows a "No results found" message when hasResults is false.
   */
  if (!hasResults) {
    return <div className={`p-4 text-center text-sm text-gray-500 ${className}`}>No results found</div>;
  }

  const renderedItems: ReactNode[] = [];
  let itemIndex = 0;

  /**
   * @brief Renders ungrouped items with optional separators
   * @description Iterates through ungrouped items, renders each option, and conditionally
   * adds a separator after each item based on the separatorAccessor function result.
   * The original index is found to ensure correct separator placement relative to the
   * original items array order.
   */
  groupedItems.ungrouped.forEach((item) => {
    const originalIndex = items.findIndex((i) => getItemKey(i) === getItemKey(item));
    renderedItems.push(renderOption(item, itemIndex));
    itemIndex++;
    // Show separator after item if getItemSeparator returns true (for all except last)
    if (separatorAccessor && originalIndex >= 0 && separatorAccessor(item, originalIndex)) {
      renderedItems.push(
        <li key={`separator-${originalIndex}`} role="separator" className="border-b border-gray-200 my-1" />
      );
    }
  });

  /**
   * @brief Renders sectioned items with optional separators
   * @description Iterates through sections, renders section headers, and for each item
   * in a section, renders the option with optional separators. The original index is
   * found to ensure correct separator placement relative to the original items array order,
   * maintaining consistent separator behavior across grouped and ungrouped items.
   */
  groupedItems.sections.forEach((section) => {
    renderedItems.push(renderSectionHeader(section, itemIndex));
    itemIndex++;
    section.items.forEach((item) => {
      const originalIndex = items.findIndex((i) => getItemKey(i) === getItemKey(item));
      renderedItems.push(renderOption(item, itemIndex));
      itemIndex++;
      // Show separator after item if getItemSeparator returns true (for all except last)
      if (separatorAccessor && originalIndex >= 0 && separatorAccessor(item, originalIndex)) {
        renderedItems.push(
          <li key={`separator-${originalIndex}`} role="separator" className="border-b border-gray-200 my-1" />
        );
      }
    });
  });

  // Reverse items when opening upward with staggered animations
  const finalItems = staggered && computedPlacement === "top" ? [...renderedItems].reverse() : renderedItems;

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

/**
 * @brief Default dropdown option component
 * @description Renders a clickable dropdown option with icon, label, and optional description.
 * Handles selection state, disabled state, and hover effects. Provides proper ARIA attributes
 * for accessibility.
 * @template T The type of the item
 * @param props Option configuration
 * @param props.item The item data
 * @param props.onSelect Callback function when the option is clicked
 * @param props.isSelected Whether this option is currently selected
 * @param props.displayText The text to display as the label
 * @param props.dataKey Unique key for the option element
 * @param props.description Optional description text shown below the label
 * @param props.icon Optional icon element to display before the label
 * @param props.isDisabled Whether this option is disabled
 * @param props.className Additional CSS classes for the option
 * @returns JSX element for the option
 */
function DropdownOption<T>({
  item,
  onSelect,
  isSelected,
  displayText,
  dataKey,
  description,
  icon,
  isDisabled = false,
  className = "",
}: {
  item: T;
  onSelect: (item: T) => void;
  isSelected: boolean;
  displayText: string;
  dataKey: string;
  description: string | null;
  icon?: ReactNode;
  isDisabled?: boolean;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  /**
   * @brief Handles click events on the option
   * @description Calls the onSelect callback if the option is not disabled.
   * Prevents selection of disabled items.
   */
  const handleClick = () => {
    if (!isDisabled) {
      onSelect(item);
    }
  };

  const baseClasses = "px-3 py-1.5 text-sm transition-colors";
  const selectedClasses = isSelected ? "bg-blue-50 text-blue-600 font-medium" : "";
  const hasCustomHover = className.includes("hover:");
  const disabledClasses = isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
  // Remove hover classes from className since we'll handle hover via inline styles
  const classNameWithoutHover = className.replace(/hover:[^\s]+/g, "").trim();
  const combinedClasses = `${baseClasses} ${selectedClasses} ${disabledClasses} ${classNameWithoutHover}`.trim();

  // Extract hover background color from className if present
  const hoverBgMatch = className.match(/hover:!?bg-\[([^\]]+)\]/);
  const hoverBgColor = hoverBgMatch ? hoverBgMatch[1] : hasCustomHover ? "#fee2e2" : "#f3f4f6"; // red-100 or gray-100

  return (
    <div
      data-key={dataKey}
      onClick={handleClick}
      className={combinedClasses}
      style={isHovered && !isDisabled ? { backgroundColor: hoverBgColor } : undefined}
      role="option"
      aria-selected={isSelected}
      aria-disabled={isDisabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2">
        <div className="flex flex-col flex-1">
          <span>{displayText}</span>
          {description && <span className="text-xs font-normal text-gray-500">{description}</span>}
        </div>
        {icon && (
          <span className="text-base" aria-hidden>
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}
