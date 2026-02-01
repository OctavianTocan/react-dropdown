/**
 * @file DropdownTrigger.tsx
 * @brief Trigger button component for dropdown
 */

'use client';

import { useDropdownContext } from './DropdownContext';
import type { DropdownTriggerProps } from './types';

/**
 * @brief Trigger button that opens/closes the dropdown
 *
 * This component renders the button that users click to open the dropdown.
 * It displays the current selection or placeholder text and includes
 * a dropdown arrow indicator.
 *
 * @param props Trigger configuration and callbacks
 * @returns JSX element for the trigger button
 */
export function DropdownTrigger({
  displayValue,
  placeholder = 'Select an option',
  className = '',
  'data-testid': testId = 'dropdown-trigger',
}: DropdownTriggerProps) {
  const { isOpen, toggleDropdown, disabled } = useDropdownContext();

  /**
   * @brief Builds CSS classes for the trigger button
   * @returns Complete CSS class string
   */
  const buildTriggerClassName = () => {
    const baseClasses =
      'w-full flex items-center justify-between px-3 py-2 text-left border border-gray-300 rounded-lg bg-white transition-colors';
    const interactiveClasses =
      'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0B4F75] focus-visible:border-transparent hover:border-gray-400 cursor-pointer';
    const disabledClasses = 'opacity-50 cursor-not-allowed';

    return `${baseClasses} ${disabled ? disabledClasses : interactiveClasses}`;
  };

  /**
   * @brief Builds CSS classes for the display text
   * @returns CSS class string based on whether value exists
   */
  const buildTextClassName = () => {
    return displayValue ? 'text-gray-900' : 'text-gray-400';
  };

  return (
    <button
      type="button"
      onClick={toggleDropdown}
      disabled={disabled}
      className={`${buildTriggerClassName()} ${className}`}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-label={displayValue ? undefined : placeholder || 'Select an option'}
      data-testid={testId}
    >
      <span className={buildTextClassName()}>{displayValue || placeholder}</span>
      <DropdownArrowIcon isOpen={isOpen} />
    </button>
  );
}

/**
 * @brief Props for dropdown arrow icon component
 */
interface DropdownArrowIconProps {
  /** Whether the dropdown is currently open */
  isOpen: boolean;
}

/**
 * @brief Dropdown arrow icon component
 * @param props Arrow configuration
 * @returns JSX element for the arrow icon
 */
function DropdownArrowIcon({ isOpen }: DropdownArrowIconProps) {
  return (
    <svg
      className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
