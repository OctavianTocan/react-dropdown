/**
 * @file DropdownListItems.tsx
 * @brief Rendering helpers for dropdown list rows, sections, and separators
 */

import type { ReactNode } from "react";
import { domAnimation, LazyMotion } from "motion/react";
import * as m from "motion/react-m";
import { DropdownOption } from "./DropdownOption";
import type { DropdownContextValue, DropdownListProps, DropdownSectionMeta } from "./types";

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
export interface GroupedItems<T> {
  /** Array of section buckets, each containing section metadata and its items */
  sections: SectionBucket<T>[];
  /** Array of items that don't belong to any section */
  ungrouped: T[];
}

export interface DropdownListAccessors<T> {
  description?: DropdownContextValue<T>["getItemDescription"];
  icon?: DropdownContextValue<T>["getItemIcon"];
  separator?: DropdownContextValue<T>["getItemSeparator"];
  disabled?: DropdownContextValue<T>["getItemDisabled"];
  className?: DropdownContextValue<T>["getItemClassName"];
}

interface DropdownMotionConfig {
  computedPlacement: "top" | "bottom";
  enterDuration: number;
  staggerDelay: number;
  staggered: boolean;
}

interface DropdownSectionHeaderProps extends DropdownMotionConfig {
  section: SectionBucket<unknown>;
  index: number;
}

interface DropdownListItemProps<T> extends DropdownMotionConfig {
  item: T;
  index: number;
  selectedItemKey: string | null;
  getItemKey: (item: T) => string;
  getItemDisplay: (item: T) => string;
  renderItem?: DropdownListProps<T>["renderItem"];
  accessors: DropdownListAccessors<T>;
  onSelect: (item: T) => void;
  focusedIndex?: number;
  getItemId?: (item: T, index: number) => string;
  onItemPointerEnter?: (index: number) => void;
}

interface BuildRenderedItemsOptions<T> extends DropdownMotionConfig {
  items: readonly T[];
  groupedItems: GroupedItems<T>;
  selectedItemKey: string | null;
  getItemKey: (item: T) => string;
  getItemDisplay: (item: T) => string;
  renderItem?: DropdownListProps<T>["renderItem"];
  accessors: DropdownListAccessors<T>;
  onSelect: (item: T) => void;
  focusedIndex?: number;
  getItemId?: (item: T, index: number) => string;
  onItemPointerEnter?: (index: number) => void;
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
export const groupItemsBySection = <T,>(
  items: readonly T[],
  resolveSection?: (item: T) => DropdownSectionMeta | null | undefined
): GroupedItems<T> => {
  if (!resolveSection) {
    return { sections: [], ungrouped: [...items] };
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

    // existingIndex was just registered via sectionIndex.set(section.key, sections.length)
    // immediately before the bucket was pushed, so it always points at a real
    // entry; the optional chain satisfies `noUncheckedIndexedAccess` without
    // changing runtime behavior.
    sections[existingIndex]?.items.push(item);
  });

  return { sections, ungrouped };
};

/**
 * @brief Builds the ordered render list for ungrouped and sectioned items
 * @description Emits separators before marked items and preserves the visual
 * item index used by staggered animation and keyboard focus integration.
 * @template T The type of items in the dropdown
 * @param options Item assembly configuration
 * @returns Ordered nodes ready to render inside the listbox
 */
export function buildRenderedItems<T>(options: BuildRenderedItemsOptions<T>): ReactNode[] {
  const {
    items,
    groupedItems,
    computedPlacement,
    staggered,
  } = options;
  const renderedItems: ReactNode[] = [];
  let itemIndex = 0;

  groupedItems.ungrouped.forEach((item) => {
    const originalIndex = items.findIndex((i) => options.getItemKey(i) === options.getItemKey(item));
    pushSeparatorIfNeeded({
      item,
      originalIndex,
      shouldRender: originalIndex > 0,
      renderedItems,
      accessors: options.accessors,
    });
    pushDropdownItem(renderedItems, options, item, itemIndex);
    itemIndex++;
  });

  groupedItems.sections.forEach((section) => {
    renderedItems.push(
      <DropdownSectionHeader
        key={`section-${section.meta.key}`}
        section={section}
        index={itemIndex}
        {...getMotionConfig(options)}
      />
    );
    itemIndex++;
    section.items.forEach((item, indexInSection) => {
      const originalIndex = items.findIndex((i) => options.getItemKey(i) === options.getItemKey(item));
      pushSeparatorIfNeeded({
        item,
        originalIndex,
        shouldRender: originalIndex >= 0 && indexInSection > 0,
        renderedItems,
        accessors: options.accessors,
      });
      pushDropdownItem(renderedItems, options, item, itemIndex);
      itemIndex++;
    });
  });

  return staggered && computedPlacement === "top" ? [...renderedItems].reverse() : renderedItems;
}

function pushDropdownItem<T>(
  renderedItems: ReactNode[],
  options: BuildRenderedItemsOptions<T>,
  item: T,
  index: number
): void {
  renderedItems.push(
    <DropdownListItem
      key={options.getItemKey(item)}
      item={item}
      index={index}
      selectedItemKey={options.selectedItemKey}
      getItemKey={options.getItemKey}
      getItemDisplay={options.getItemDisplay}
      renderItem={options.renderItem}
      accessors={options.accessors}
      onSelect={options.onSelect}
      focusedIndex={options.focusedIndex}
      getItemId={options.getItemId}
      onItemPointerEnter={options.onItemPointerEnter}
      {...getMotionConfig(options)}
    />
  );
}

function pushSeparatorIfNeeded<T>({
  item,
  originalIndex,
  shouldRender,
  renderedItems,
  accessors,
}: {
  item: T;
  originalIndex: number;
  shouldRender: boolean;
  renderedItems: ReactNode[];
  accessors: DropdownListAccessors<T>;
}): void {
  if (accessors.separator && shouldRender && accessors.separator(item, originalIndex)) {
    renderedItems.push(buildSeparatorNode(`separator-${originalIndex}`));
  }
}

function getMotionConfig(config: DropdownMotionConfig): DropdownMotionConfig {
  return {
    computedPlacement: config.computedPlacement,
    enterDuration: config.enterDuration,
    staggerDelay: config.staggerDelay,
    staggered: config.staggered,
  };
}

/**
 * @brief Renders a section header for grouped items
 * @description Creates a list item with section metadata (label, icon, description)
 * that serves as a header for a group of related items.
 * @param props Section header configuration
 * @returns JSX element for the section header
 */
function DropdownSectionHeader({
  section,
  index,
  computedPlacement,
  enterDuration,
  staggerDelay,
  staggered,
}: DropdownSectionHeaderProps): ReactNode {
  const content = (
    <li
      role="presentation"
      className="px-3 py-2 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {section.meta.icon && (
            <span className="text-base text-zinc-500" aria-hidden>
              {section.meta.icon}
            </span>
          )}
          <span>{section.meta.label}</span>
        </div>
        {section.meta.description && (
          <span className="text-[11px] font-normal normal-case text-zinc-400">{section.meta.description}</span>
        )}
      </div>
    </li>
  );

  return renderWithOptionalMotion(content, `section-wrapper-${section.meta.key}`, index, {
    computedPlacement,
    enterDuration,
    staggerDelay,
    staggered,
  });
}

/**
 * @brief Renders a single dropdown option item
 * @description Creates a list item containing either a custom rendered item or
 * the default DropdownOption component.
 * @template T The type of items in the dropdown
 * @param props Row rendering configuration
 * @returns JSX element for the option row
 */
function DropdownListItem<T>({
  item,
  index,
  selectedItemKey,
  getItemKey,
  getItemDisplay,
  renderItem,
  accessors,
  onSelect,
  focusedIndex,
  getItemId,
  onItemPointerEnter,
  computedPlacement,
  enterDuration,
  staggerDelay,
  staggered,
}: DropdownListItemProps<T>): ReactNode {
  const key = getItemKey(item);
  const isSelected = selectedItemKey === key;
  const isDisabled = accessors.disabled ? accessors.disabled(item) : false;
  const itemId = getItemId ? getItemId(item, index) : `dropdown-item-${key}`;
  const isKeyboardFocused = focusedIndex !== undefined && focusedIndex === index;
  const renderedCustomItem = renderItem ? renderItem(item, isSelected, onSelect) : null;
  const optionContent = renderItem ? (
    <li
      id={itemId}
      data-key={key}
      data-focused={isKeyboardFocused ? "true" : undefined}
      onMouseEnter={onItemPointerEnter ? () => onItemPointerEnter(index) : undefined}
    >
      {renderedCustomItem}
    </li>
  ) : (
    <li
      id={itemId}
      data-key={key}
      data-focused={isKeyboardFocused ? "true" : undefined}
      onMouseEnter={onItemPointerEnter ? () => onItemPointerEnter(index) : undefined}
    >
      <DropdownOption
        dataKey={key}
        item={item}
        onSelect={onSelect}
        isSelected={isSelected}
        displayText={getItemDisplay(item)}
        description={accessors.description?.(item) ?? null}
        icon={accessors.icon?.(item)}
        isDisabled={isDisabled}
        className={accessors.className ? accessors.className(item, isSelected, isDisabled) : ""}
      />
    </li>
  );

  return renderWithOptionalMotion(optionContent, `motion-${key}`, index, {
    computedPlacement,
    enterDuration,
    staggerDelay,
    staggered,
  });
}

/**
 * @brief Renders a divider list item using design-system tokens
 * @description Themed via Tailwind's `bg-border` so it adapts to dark mode
 * and design-system overrides. Marked `aria-hidden` because separators are
 * decorative, the `role="separator"` already announces the boundary to
 * screen readers.
 * @param key Unique React key for the separator
 * @returns A list element rendering a 1-px horizontal rule
 */
const buildSeparatorNode = (key: string): ReactNode => (
  <li
    key={key}
    role="separator"
    aria-hidden="true"
    className="mx-1 my-1 h-px bg-border list-none"
  />
);

/**
 * @brief Wraps list content in the optional staggered Motion entry animation
 * @param content Node to render
 * @param key Stable React key for the wrapper
 * @param index Visual index used to calculate stagger delay
 * @param config Motion behavior for the current dropdown placement
 * @returns Either the original node or a Motion-wrapped node
 */
const renderWithOptionalMotion = (
  content: ReactNode,
  key: string,
  index: number,
  config: DropdownMotionConfig
): ReactNode => {
  if (!config.staggered) {
    return content;
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        key={key}
        initial={{ opacity: 0, y: config.computedPlacement === "top" ? -10 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: config.enterDuration * 0.5,
          delay: index * config.staggerDelay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {content}
      </m.div>
    </LazyMotion>
  );
};
