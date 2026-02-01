/**
 * @file index.ts
 * @brief Barrel export for dropdown components
 */

// Export all dropdown components
export { DropdownRoot } from './DropdownRoot';
export { DropdownTrigger } from './DropdownTrigger';
export { DropdownContent } from './DropdownContent';
export { DropdownSearch } from './DropdownSearch';
export { DropdownList } from './DropdownList';

// Export pre-made dropdown components
export { DropdownSearchable } from './DropdownSearchable';
export { DropdownSimple } from './DropdownSimple';
export { DropdownMenu } from './DropdownMenu';
export type { DropdownMenuProps } from './DropdownMenu';

// Export context and hooks
export { DropdownProvider, useDropdownContext, useKeyboardNavigation, useClickOutside } from './DropdownContext';

// Export types
export type {
  BaseDropdownProps,
  DropdownRootProps,
  DropdownTriggerProps,
  DropdownContentProps,
  DropdownSearchProps,
  DropdownListProps,
  DropdownOptionProps,
  DropdownContextValue,
  DropdownSectionMeta,
  DropdownPlacement,
} from './types';

// Import components for compound export
import { DropdownRoot } from './DropdownRoot';
import { DropdownTrigger } from './DropdownTrigger';
import { DropdownContent } from './DropdownContent';
import { DropdownSearch } from './DropdownSearch';
import { DropdownList } from './DropdownList';
import { DropdownSearchable } from './DropdownSearchable';
import { DropdownSimple } from './DropdownSimple';
import { DropdownMenu } from './DropdownMenu';

/**
 * @brief Compound dropdown component
 *
 * This provides a compound component pattern where all sub-components
 * are attached to the main DropdownRoot component for easy composition.
 * Includes both pure composition components and pre-made convenience components.
 */
const Dropdown = {
  Root: DropdownRoot,
  Trigger: DropdownTrigger,
  Content: DropdownContent,
  Search: DropdownSearch,
  List: DropdownList,
  Simple: DropdownSimple,
  Searchable: DropdownSearchable,
  Menu: DropdownMenu,
};

export default Dropdown;
