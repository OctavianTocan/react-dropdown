/**
 * @fileoverview @octavian-tocan/react-dropdown - Composable dropdown system
 *
 * A flexible, composable dropdown (select) component system for React with TypeScript support.
 * Built with accessibility in mind and featuring smooth animations powered by Motion.
 *
 * | Export | Description |
 * |--------|-------------|
 * | Dropdown | Compound component with Root, Trigger, Content, etc. |
 * | DropdownRoot | Provider component that manages all state |
 * | DropdownTrigger | Button that opens/closes the dropdown |
 * | DropdownContent | Container for custom compositions |
 * | DropdownSearch | Search input component |
 * | DropdownList | Scrollable list of options |
 * | DropdownSimple | Pre-made dropdown with list only |
 * | DropdownSearchable | Pre-made dropdown with search + list |
 * | DropdownMenu | Action menu variant |
 *
 * @example Basic usage with compound component
 * ```tsx
 * import Dropdown from '@octavian-tocan/react-dropdown';
 *
 * const items = [
 *   { id: '1', label: 'Option 1' },
 *   { id: '2', label: 'Option 2' },
 * ];
 *
 * function MyDropdown() {
 *   const [selected, setSelected] = useState(null);
 *
 *   return (
 *     <Dropdown.Root
 *       items={items}
 *       selectedItem={selected}
 *       onSelect={setSelected}
 *       getItemKey={(item) => item.id}
 *       getItemDisplay={(item) => item.label}
 *     >
 *       <Dropdown.Trigger displayValue={selected?.label ?? ''} placeholder="Select..." />
 *       <Dropdown.Simple />
 *     </Dropdown.Root>
 *   );
 * }
 * ```
 *
 * @example Searchable dropdown
 * ```tsx
 * import Dropdown from '@octavian-tocan/react-dropdown';
 *
 * <Dropdown.Root items={items} onSelect={handleSelect} getItemKey={...} getItemDisplay={...}>
 *   <Dropdown.Trigger displayValue={selected?.label ?? ''} />
 *   <Dropdown.Searchable searchPlaceholder="Search..." />
 * </Dropdown.Root>
 * ```
 */

"use client";

// Export all dropdown components
export { DropdownRoot } from "./DropdownRoot";
export { DropdownTrigger } from "./DropdownTrigger";
export { DropdownContent } from "./DropdownContent";
export { DropdownSearch } from "./DropdownSearch";
export { DropdownList } from "./DropdownList";
export { DropdownHeader } from "./DropdownHeader";
export { DropdownFooter } from "./DropdownFooter";

// Export pre-made dropdown components
export { DropdownSearchable } from "./DropdownSearchable";
export { DropdownSimple } from "./DropdownSimple";
export { DropdownMenu } from "./DropdownMenu";
export type { DropdownMenuProps } from "./DropdownMenu";

// Export context and hooks
export { DropdownProvider, useDropdownContext, useKeyboardNavigation, useClickOutside } from "./DropdownContext";

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
  DropdownAnimationState,
  DropdownHeaderProps,
  DropdownFooterProps,
} from "./types";

// Import components for compound export
import { DropdownRoot } from "./DropdownRoot";
import { DropdownTrigger } from "./DropdownTrigger";
import { DropdownContent } from "./DropdownContent";
import { DropdownSearch } from "./DropdownSearch";
import { DropdownList } from "./DropdownList";
import { DropdownHeader } from "./DropdownHeader";
import { DropdownFooter } from "./DropdownFooter";
import { DropdownSearchable } from "./DropdownSearchable";
import { DropdownSimple } from "./DropdownSimple";
import { DropdownMenu } from "./DropdownMenu";

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
  Header: DropdownHeader,
  Footer: DropdownFooter,
  Simple: DropdownSimple,
  Searchable: DropdownSearchable,
  Menu: DropdownMenu,
};

export default Dropdown;
