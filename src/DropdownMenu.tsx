/**
 * @file DropdownMenu.tsx
 * @brief Menu variant component optimized for action menus (not selection)
 *
 * This component provides a convenient wrapper for action menus with support for:
 * - Separators between items
 * - Disabled states
 * - Custom styling
 * - Icons
 * - Conditional rendering
 */

'use client';

import React, { useRef } from 'react';
import type { ReactNode } from 'react';
import { DropdownRoot } from './DropdownRoot';
import { DropdownContent } from './DropdownContent';
import { DropdownList } from './DropdownList';
import { useDropdownContext } from './DropdownContext';
import type { DropdownRootProps } from './types';

/**
 * @brief Props for DropdownMenu component
 */
export interface DropdownMenuProps<T>
  extends Omit<DropdownRootProps<T>, 'selectedItem' | 'triggerRef'> {
  /** Custom trigger component (button, icon, etc.) */
  trigger: ReactNode;
  /** Optional className for the dropdown content container */
  contentClassName?: string;
  /** Optional className for the dropdown list */
  listClassName?: string;
  /** Optional callback invoked when dropdown open state changes */
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * @brief Menu trigger wrapper that uses dropdown context
 */
const MenuTrigger = React.forwardRef<HTMLDivElement, { children: ReactNode }>(
  ({ children }, ref) => {
    const { isOpen, toggleDropdown } = useDropdownContext();

    return (
      <div ref={ref} onClick={toggleDropdown} aria-expanded={isOpen} aria-haspopup="menu">
        {children}
      </div>
    );
  }
);
MenuTrigger.displayName = 'MenuTrigger';

/**
 * @brief DropdownMenu component - optimized for action menus
 *
 * This is a variant component that simplifies creating action menus (like context menus,
 * three-dot menus, etc.) with built-in support for separators, disabled states, and custom styling.
 *
 * @example
 * ```tsx
 * interface MenuItem {
 *   id: string;
 *   label: string;
 *   icon: ReactNode;
 *   onClick: () => void;
 *   disabled?: boolean;
 *   showSeparator?: boolean;
 * }
 *
 * const items: MenuItem[] = [
 *   { id: '1', label: 'Edit', icon: <Edit />, onClick: handleEdit },
 *   { id: '2', label: 'Delete', icon: <Trash />, onClick: handleDelete, showSeparator: true },
 * ];
 *
 * <DropdownMenu
 *   items={items}
 *   trigger={<MoreHorizontal />}
 *   onSelect={(item) => item.onClick()}
 *   getItemKey={(item) => item.id}
 *   getItemDisplay={(item) => item.label}
 *   getItemIcon={(item) => item.icon}
 *   getItemSeparator={(item) => item.showSeparator ?? false}
 *   getItemDisabled={(item) => item.disabled ?? false}
 *   contentClassName="right-0! top-full! mt-2! bg-white border border-gray-200 rounded-2xl shadow-lg p-2 gap-1.5 z-50 min-w-[200px]"
 * />
 * ```
 */
export function DropdownMenu<T>({
  items,
  onSelect,
  getItemKey,
  getItemDisplay,
  getItemIcon,
  getItemDescription,
  getItemSeparator,
  getItemDisabled,
  getItemClassName,
  getItemSection,
  filterItems,
  disabled = false,
  placeholder,
  className = '',
  dropdownPlacement = 'bottom',
  closeOnSelect = true,
  trigger,
  contentClassName = '',
  listClassName = '',
  onOpenChange,
  usePortal = false,
  'data-testid': testId = 'dropdown-menu',
}: DropdownMenuProps<T>) {
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <DropdownRoot
      items={items}
      selectedItem={null}
      onSelect={onSelect}
      getItemKey={getItemKey}
      getItemDisplay={getItemDisplay}
      getItemIcon={getItemIcon}
      getItemDescription={getItemDescription}
      getItemSeparator={getItemSeparator}
      getItemDisabled={getItemDisabled}
      getItemClassName={getItemClassName}
      getItemSection={getItemSection}
      filterItems={filterItems}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      dropdownPlacement={dropdownPlacement}
      closeOnSelect={closeOnSelect}
      onOpenChange={onOpenChange}
      triggerRef={triggerRef}
      usePortal={usePortal}
      data-testid={testId}
    >
      <MenuTrigger ref={triggerRef}>{trigger}</MenuTrigger>
      <DropdownContent className={contentClassName}>
        <DropdownList
          items={items}
          hasResults={items.length > 0}
          selectedItem={null}
          getItemKey={getItemKey}
          getItemDisplay={getItemDisplay}
          getItemIcon={getItemIcon}
          getItemDescription={getItemDescription}
          getItemSeparator={getItemSeparator}
          getItemDisabled={getItemDisabled}
          getItemClassName={getItemClassName}
          getItemSection={getItemSection}
          className={listClassName}
        />
      </DropdownContent>
    </DropdownRoot>
  );
}
