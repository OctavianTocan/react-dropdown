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

import React, { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { DropdownRoot } from './DropdownRoot';
import { DropdownContent } from './DropdownContent';
import { DropdownList } from './DropdownList';
import { useDropdownContext } from './DropdownContext';
import { useMenuKeyboard } from './useMenuKeyboard';
import { Slot } from './Slot';
import type { DropdownRootProps, DropdownListProps } from './types';

/**
 * @brief Props for DropdownMenu component
 */
export interface DropdownMenuProps<T>
  extends Omit<DropdownRootProps<T>, 'selectedItem' | 'triggerRef'> {
  /** Custom trigger component (button, icon, etc.) */
  trigger: ReactNode;
  /**
   * When `true`, the `trigger` element is rendered directly with the
   * dropdown's behavior props merged onto it (Radix-style slot pattern).
   * The single child of `trigger` becomes the actual trigger element —
   * no wrapping `<div>` — so inline-flex layouts and ARIA semantics on the
   * consumer's element are preserved.
   *
   * When `false` (default), the trigger is wrapped in a `<div>` that
   * receives the click handler and ARIA attributes. Use this when the
   * trigger is composed of multiple elements (icon + label + chevron) and
   * you don't have a single host element to delegate to.
   *
   * @example
   * ```tsx
   * <DropdownMenu
   *   asChild
   *   trigger={
   *     <Button variant="ghost">
   *       <Icon /> Open menu
   *     </Button>
   *   }
   *   ...
   * />
   * ```
   */
  asChild?: boolean;
  /** Optional className for the dropdown content container */
  contentClassName?: string;
  /** Optional className for the dropdown list */
  listClassName?: string;
  /** Optional callback invoked when dropdown open state changes */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Optional custom render function for each list item.
   * When provided, overrides the default DropdownOption rendering.
   * @param item The data item to render
   * @param isSelected Whether this item is the currently selected value
   * @param onSelect Callback to invoke when this item is chosen
   */
  renderItem?: DropdownListProps<T>['renderItem'];
}

/**
 * @brief Menu trigger wrapper that uses dropdown context
 *
 * When `asChild` is true, the trigger renders via {@link Slot} so the
 * consumer's element receives the click + ARIA props directly (no wrapping
 * `<div>`). Otherwise, falls back to a `<div>` wrapper for legacy callers
 * that compose multiple host elements as the trigger.
 */
const MenuTrigger = React.forwardRef<HTMLElement, { children: ReactNode; asChild?: boolean }>(
  ({ children, asChild = false }, ref) => {
    const { isOpen, toggleDropdown } = useDropdownContext();
    const sharedProps = {
      onClick: toggleDropdown,
      'aria-expanded': isOpen,
      'aria-haspopup': 'menu' as const,
      'data-state': isOpen ? ('open' as const) : ('closed' as const),
    };

    if (asChild) {
      return (
        <Slot ref={ref} {...sharedProps}>
          {children}
        </Slot>
      );
    }
    return (
      <div ref={ref as React.Ref<HTMLDivElement>} {...sharedProps}>
        {children}
      </div>
    );
  }
);
MenuTrigger.displayName = 'MenuTrigger';

/**
 * @brief Forwarded subset of `DropdownList` props needed by the keyboard surface
 *
 * Avoids re-listing the entire `DropdownListProps<T>` shape — anything not
 * touched by keyboard wiring is forwarded to `DropdownList` unchanged.
 */
type MenuKeyboardSurfaceProps<T> = Pick<
  DropdownListProps<T>,
  | 'items'
  | 'getItemKey'
  | 'getItemDisplay'
  | 'getItemIcon'
  | 'getItemDescription'
  | 'getItemSeparator'
  | 'getItemDisabled'
  | 'getItemClassName'
  | 'getItemSection'
  | 'renderItem'
  | 'className'
> & {
  /** Optional id prefix shared by all items so `aria-activedescendant` resolves. */
  idPrefix: string;
};

/**
 * @brief Keyboard-surface wrapper for `DropdownMenu`'s list
 *
 * Renders an `aria-activedescendant`-driven `<ul role="menu">` that:
 * - Hosts focus while the menu is open (so keydown events fire here regardless
 *   of consumer's renderItem markup)
 * - Tracks the active item via `useMenuKeyboard` (Arrow / Home / End / Enter /
 *   Escape / type-ahead)
 * - Reports the active item back to `DropdownList` via `focusedIndex` so
 *   `<li data-focused>` can be styled by consumers
 *
 * Consumers don't see this component directly — `DropdownMenu` uses it as the
 * default body. Custom compositions (using the lower-level `Dropdown.Root` +
 * `Dropdown.Content` + `Dropdown.List`) can opt in by calling `useMenuKeyboard`
 * themselves and wiring the returned `focusedIndex` into `Dropdown.List`.
 */
function MenuKeyboardSurface<T>({
  idPrefix,
  className,
  ...listProps
}: MenuKeyboardSurfaceProps<T>): React.JSX.Element {
  const { isOpen, getItemDisplay, getItemDisabled, onSelect, closeDropdown, items } =
    useDropdownContext<T>();
  const { focusedIndex, handleKeyDown, setFocusedIndex } = useMenuKeyboard<T>({
    items,
    isOpen,
    getItemDisplay,
    getItemDisabled,
    onActivate: onSelect,
    onClose: closeDropdown,
  });

  // Auto-focus the menu container on open so keyboard events fire from the
  // root regardless of where the consumer's renderItem put its DOM. Run in a
  // layout effect to beat the AnimatePresence enter animation.
  const surfaceRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen && surfaceRef.current?.dataset.preventAutofocus !== 'true') {
      surfaceRef.current?.focus({ preventScroll: true });
    }
  }, [isOpen]);

  const focusedItem =
    focusedIndex >= 0 && focusedIndex < items.length ? items[focusedIndex] : undefined;
  const activeDescendantId =
    focusedItem !== undefined
      ? `${idPrefix}-${listProps.getItemKey(focusedItem)}`
      : undefined;

  return (
    <div
      ref={surfaceRef}
      role="menu"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      aria-activedescendant={activeDescendantId}
      // Outline removed — focus is on the surface element but the visible
      // affordance is the focused row's `data-focused` styling, not a ring on
      // the panel container itself.
      className="outline-none"
    >
      <DropdownList<T>
        {...listProps}
        hasResults={items.length > 0}
        selectedItem={null}
        focusedIndex={focusedIndex}
        getItemId={(item) => `${idPrefix}-${listProps.getItemKey(item)}`}
        onItemPointerEnter={setFocusedIndex}
        className={className}
      />
    </div>
  );
}

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
 *   // True for items that should sit beneath a divider (e.g. an "advanced"
 *   // or destructive section). The divider renders ABOVE the marked item.
 *   separatorBefore?: boolean;
 * }
 *
 * const items: MenuItem[] = [
 *   { id: '1', label: 'Edit', icon: <Edit />, onClick: handleEdit },
 *   { id: '2', label: 'Duplicate', icon: <Copy />, onClick: handleDuplicate },
 *   // Delete is destructive — separator above visually groups it apart.
 *   { id: '3', label: 'Delete', icon: <Trash />, onClick: handleDelete, separatorBefore: true },
 * ];
 *
 * <DropdownMenu
 *   items={items}
 *   trigger={<MoreHorizontal />}
 *   onSelect={(item) => item.onClick()}
 *   getItemKey={(item) => item.id}
 *   getItemDisplay={(item) => item.label}
 *   getItemIcon={(item) => item.icon}
 *   getItemSeparator={(item) => item.separatorBefore ?? false}
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
  placement,
  dropdownPlacement,
  closeOnSelect = true,
  trigger,
  asChild = false,
  contentClassName = '',
  listClassName = '',
  renderItem,
  onOpenChange,
  usePortal = false,
  'data-testid': testId = 'dropdown-menu',
}: DropdownMenuProps<T>) {
  const triggerRef = useRef<HTMLDivElement>(null);
  // Stable id prefix so each item's id is deterministic for the lifetime of
  // this DropdownMenu, regardless of how many other dropdowns are mounted.
  const idPrefix = useId();

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
      placement={placement}
      dropdownPlacement={dropdownPlacement}
      closeOnSelect={closeOnSelect}
      onOpenChange={onOpenChange}
      triggerRef={triggerRef}
      usePortal={usePortal}
      data-testid={testId}
    >
      <MenuTrigger ref={triggerRef as React.Ref<HTMLElement>} asChild={asChild}>
        {trigger}
      </MenuTrigger>
      <DropdownContent className={contentClassName}>
        <MenuKeyboardSurface<T>
          idPrefix={idPrefix}
          items={items}
          getItemKey={getItemKey}
          getItemDisplay={getItemDisplay}
          getItemIcon={getItemIcon}
          getItemDescription={getItemDescription}
          getItemSeparator={getItemSeparator}
          getItemDisabled={getItemDisabled}
          getItemClassName={getItemClassName}
          getItemSection={getItemSection}
          renderItem={renderItem}
          className={listClassName}
        />
      </DropdownContent>
    </DropdownRoot>
  );
}
