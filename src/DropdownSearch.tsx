/**
 * @file DropdownSearch.tsx
 * @brief Search input component for dropdown functionality
 */

'use client';

import { useDropdownContext } from './DropdownContext';
import type { DropdownSearchProps } from './types';

/**
 * @brief Search input component for filtering dropdown items
 *
 * This component provides a search input that filters the dropdown items
 * as the user types. It prevents tabbing out of the input
 * and includes proper accessibility attributes.
 *
 * @param props Search input configuration
 * @returns JSX element for the search input
 */
export const DropdownSearch = ({
  value,
  onChange,
  inputRef,
  placeholder = 'Search...',
  className = '',
  'data-testid': testId = 'dropdown-search',
}: DropdownSearchProps) => {
  const { disabled } = useDropdownContext();

  /**
   * @brief Handles keyboard events to prevent tabbing out
   * @param event Keyboard event
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent tabbing out of the search input
    if (event.key === 'Tab') {
      event.preventDefault();
    }
  };

  return (
    <div className={`px-2 py-1 border-b border-gray-200 shrink-0 ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0B4F75] focus-visible:border-transparent"
        tabIndex={-1}
        data-testid={testId}
        aria-label="Search options"
      />
    </div>
  );
};
