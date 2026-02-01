/**
 * @file DropdownSimple.tsx
 * @brief Pre-made dropdown with list only (no search)
 */

'use client';

import { useDropdownContext } from './DropdownContext';
import { DropdownList } from './DropdownList';
import { DropdownContent } from './DropdownContent';

/**
 * @brief Pre-configured dropdown with list only
 *
 * This is a convenience component that provides just a list without search.
 * Use this for simple dropdowns with small item counts where search isn't needed.
 * For custom compositions, use DropdownContent with your own children.
 *
 * @param props Dropdown configuration
 * @returns JSX element for simple dropdown or null if closed
 */
export function DropdownSimple({
  className = '',
  'data-testid': testId = 'dropdown-simple',
}: {
  className?: string;
  'data-testid'?: string;
}) {
  const {
    filteredItems,
    selectedItem,
    getItemKey,
    getItemDisplay,
    getItemDescription,
    getItemIcon,
    getItemSection,
  } = useDropdownContext();

  return (
    <DropdownContent className={className} data-testid={testId}>
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
