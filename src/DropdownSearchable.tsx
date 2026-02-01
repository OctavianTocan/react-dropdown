/**
 * @file DropdownSearchable.tsx
 * @brief Pre-made dropdown with search and list
 */

'use client';

import { useDropdownContext } from './DropdownContext';
import { DropdownSearch } from './DropdownSearch';
import { DropdownList } from './DropdownList';
import { DropdownContent } from './DropdownContent';

/**
 * @brief Pre-configured dropdown with search input and list
 *
 * This is a convenience component that combines DropdownSearch and DropdownList.
 * Use this for the common case where you want a searchable dropdown.
 * For custom compositions, use DropdownContent with your own children.
 *
 * @param props Dropdown configuration
 * @returns JSX element for searchable dropdown or null if closed
 */
export function DropdownSearchable({
  searchPlaceholder = 'Search...',
  className = '',
  'data-testid': testId = 'dropdown-searchable',
  hideSearchThreshold,
}: {
  searchPlaceholder?: string;
  className?: string;
  'data-testid'?: string;
  /**
   * Maximum number of items before search is shown.
   * If items.length <= hideSearchThreshold, search input is hidden.
   * Useful for small lists (e.g., 4 navigation items) where search is unnecessary.
   * Default: undefined (always show search)
   */
  hideSearchThreshold?: number;
}) {
  const {
    searchQuery,
    setSearchQuery,
    filteredItems,
    selectedItem,
    getItemKey,
    getItemDisplay,
    getItemDescription,
    getItemIcon,
    getItemSection,
    items,
  } = useDropdownContext();

  // Hide search if threshold is set and items count is below threshold
  const shouldShowSearch = hideSearchThreshold === undefined || items.length > hideSearchThreshold;

  return (
    <DropdownContent className={className} data-testid={testId}>
      {shouldShowSearch && (
        <DropdownSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={searchPlaceholder}
        />
      )}
      <DropdownList
        items={filteredItems}
        hasResults={filteredItems.length > 0}
        selectedItem={selectedItem}
        getItemKey={getItemKey}
        getItemDisplay={getItemDisplay}
        getItemDescription={getItemDescription}
        getItemIcon={getItemIcon}
        getItemSection={getItemSection}
      />
    </DropdownContent>
  );
}
