'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { DropdownMenu } from './DropdownMenu';
import type { DropdownPlacement, MenuItemDef } from './types';

/** Internal wrapper that pairs a MenuItemDef with a stable React key. */
type WrappedItem = { def: MenuItemDef; key: string };

/**
 * Derives a stable React key for a MenuItemDef.
 *
 * Separators have no ID so we fall back to the positional index.
 */
function buildKey(item: MenuItemDef, index: number): string {
  switch (item.type) {
    case 'separator':
      return `sep-${index}`;
    case 'label':
      return `lbl-${item.text}`;
    case 'action':
      return `act-${item.id}`;
    case 'submenu':
      return `sub-${item.id}`;
  }
}

/** Props for {@link DropdownMenuDef}. */
export interface DropdownMenuDefProps {
  /** Element that triggers the dropdown to open. */
  trigger: ReactNode;
  /**
   * When `true`, the `trigger` element is rendered directly with the
   * dropdown's behavior props merged onto it (Radix-style slot pattern).
   * The single child of `trigger` becomes the actual trigger element.
   */
  asChild?: boolean;
  /** Ordered list of menu item definitions to render. */
  items: readonly MenuItemDef[];
  /** Where the dropdown should appear relative to the trigger. */
  placement?: DropdownPlacement;
  /** Extra CSS classes applied to the dropdown content panel. */
  contentClassName?: string;
  /** Called when the dropdown opens or closes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** When true, renders the dropdown content via a portal to document.body (escapes overflow:hidden ancestors). */
  usePortal?: boolean;
}

function SeparatorRow(): React.JSX.Element {
  return <div role="separator" aria-hidden={true} className="my-1 h-px bg-border" />;
}

function LabelRow({ text }: { text: string }): React.JSX.Element {
  return (
    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
      {text}
    </div>
  );
}

function ActionRow({
  label,
  icon,
  shortcut,
  disabled = false,
  onClick,
}: {
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 hover:bg-foreground/[0.04]"
    >
      {icon != null && (
        <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center">
          {icon}
        </span>
      )}
      <span className="flex-1 text-left">{label}</span>
      {shortcut != null && (
        <kbd aria-hidden={true} className="ml-auto text-xs tracking-widest text-muted-foreground">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}

/**
 * Renders a list of MenuItemDef children, recursing into `SubmenuRow` for
 * any nested submenu items. Used by both the top-level `DropdownMenuDef`
 * (with the parent-managed accordion state) and each `SubmenuRow` (which
 * manages its own independent accordion state for the next level down).
 *
 * @param items Child items to render
 * @param openSubmenuId Currently expanded submenu id at this level, or null
 * @param onToggleSubmenu Toggles a submenu open/closed at this level
 * @param onActionDone Closes the entire dropdown chain — fired on action click
 * @returns Array of rendered nodes
 */
function renderItems(
  items: readonly MenuItemDef[],
  openSubmenuId: string | null,
  onToggleSubmenu: (id: string) => void,
  onActionDone: () => void,
): ReactNode {
  return items.map((item, index) => {
    const key = buildKey(item, index);
    switch (item.type) {
      case 'separator':
        return <SeparatorRow key={key} />;
      case 'label':
        return <LabelRow key={key} text={item.text} />;
      case 'action':
        return (
          <ActionRow
            key={key}
            label={item.label}
            icon={item.icon}
            shortcut={item.shortcut}
            disabled={item.disabled}
            onClick={() => {
              item.onClick();
              onActionDone();
            }}
          />
        );
      case 'submenu':
        return (
          <SubmenuRow
            key={key}
            id={item.id}
            label={item.label}
            icon={item.icon}
            childItems={item.children}
            isOpen={openSubmenuId === item.id}
            onToggle={onToggleSubmenu}
            onActionDone={onActionDone}
          />
        );
    }
  });
}

/**
 * @brief Inline-accordion submenu row for `DropdownMenuDef`
 *
 * Each row owns the accordion state for ITS OWN children — so submenus can
 * nest arbitrarily deep with each level toggling independently. Only one
 * direct child submenu can be expanded at a time within the same parent (the
 * familiar accordion behavior).
 */
function SubmenuRow({
  id,
  label,
  icon,
  childItems,
  isOpen,
  onToggle,
  onActionDone,
}: {
  id: string;
  label: string;
  icon?: ReactNode;
  childItems: readonly MenuItemDef[];
  isOpen: boolean;
  onToggle: (id: string) => void;
  onActionDone: () => void;
}): React.JSX.Element {
  // Independent accordion state for THIS row's children, so nested submenus
  // toggle without colliding with the parent's selection.
  const [openChildSubmenuId, setOpenChildSubmenuId] = useState<string | null>(null);
  // Reset nested expansion when this row collapses — reopening always starts
  // with all of its children collapsed.
  useEffect(() => {
    if (!isOpen) setOpenChildSubmenuId(null);
  }, [isOpen]);

  const handleToggleChildSubmenu = useCallback((childId: string): void => {
    setOpenChildSubmenuId((prev) => (prev === childId ? null : childId));
  }, []);

  return (
    <div>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`submenu-panel-${id}`}
        onClick={() => onToggle(id)}
        className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-foreground/[0.04]"
      >
        {icon != null && (
          <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center">
            {icon}
          </span>
        )}
        <span className="flex-1 text-left">{label}</span>
        {/* Chevron rotates 180° when the panel is open */}
        <svg
          aria-hidden={true}
          className={`size-3 shrink-0 text-muted-foreground transition-transform duration-150${isOpen ? ' rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && (
        <div
          id={`submenu-panel-${id}`}
          role="group"
          aria-label={label}
          className="ml-4 mt-0.5 border-l border-border/50 pl-1"
        >
          {renderItems(childItems, openChildSubmenuId, handleToggleChildSubmenu, onActionDone)}
        </div>
      )}
    </div>
  );
}

/**
 * A convenience wrapper around {@link DropdownMenu} that renders a heterogeneous
 * menu described by a flat `MenuItemDef[]` array instead of requiring the caller
 * to build `renderItem` manually.
 *
 * Supported item types: `'label'`, `'action'`, `'submenu'` (inline accordion), and
 * `'separator'`. Selecting an action item always closes the dropdown. Clicking a
 * submenu header toggles its child panel in-place; clicking a child action closes
 * the dropdown.
 *
 * @example
 * ```tsx
 * <DropdownMenuDef
 *   trigger={<button>Open</button>}
 *   items={[
 *     { type: 'action', id: 'settings', label: 'Settings', onClick: goToSettings },
 *     { type: 'separator' },
 *     { type: 'action', id: 'logout', label: 'Log out', onClick: logout },
 *   ]}
 * />
 * ```
 */
export function DropdownMenuDef({
  trigger,
  asChild,
  items,
  placement,
  contentClassName,
  onOpenChange,
  usePortal,
}: DropdownMenuDefProps): React.JSX.Element {
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);

  const handleOpenChange = useCallback(
    (isOpen: boolean): void => {
      // Reset accordion state every time the dropdown closes so the next
      // open always starts with all submenus collapsed.
      if (!isOpen) setOpenSubmenuId(null);
      onOpenChange?.(isOpen);
    },
    [onOpenChange],
  );

  const handleToggleSubmenu = useCallback((id: string): void => {
    setOpenSubmenuId((prev) => (prev === id ? null : id));
  }, []);

  // Wrap each def in a stable key so DropdownList can key <li> elements
  // correctly, including separator items which carry no unique ID.
  const wrappedItems = useMemo<WrappedItem[]>(
    () => items.map((def, index) => ({ def, key: buildKey(def, index) })),
    [items],
  );

  return (
    <DropdownMenu<WrappedItem>
      trigger={trigger}
      asChild={asChild}
      items={wrappedItems}
      onSelect={(item) => {
        // Only action items need an explicit handler here; the dropdown
        // closes automatically via closeOnSelect after onSelect returns.
        if (item.def.type === 'action' && !item.def.disabled) {
          item.def.onClick();
        }
      }}
      getItemKey={(item) => item.key}
      getItemDisplay={(item) => {
        const { def } = item;
        if (def.type === 'action' || def.type === 'submenu') return def.label;
        if (def.type === 'label') return def.text;
        return '';
      }}
      closeOnSelect
      placement={placement}
      contentClassName={contentClassName}
      onOpenChange={handleOpenChange}
      usePortal={usePortal}
      renderItem={(item, _isSelected, onSelect) => {
        const { def } = item;
        switch (def.type) {
          case 'separator':
            return <SeparatorRow />;
          case 'label':
            return <LabelRow text={def.text} />;
          case 'action':
            return (
              <ActionRow
                label={def.label}
                icon={def.icon}
                shortcut={def.shortcut}
                disabled={def.disabled}
                onClick={() => onSelect(item)}
              />
            );
          case 'submenu':
            return (
              <SubmenuRow
                id={def.id}
                label={def.label}
                icon={def.icon}
                childItems={def.children}
                isOpen={openSubmenuId === def.id}
                onToggle={handleToggleSubmenu}
                // Clicking a nested action triggers `onSelect(item)` on the
                // parent WrappedItem so that `closeOnSelect` fires on the root
                // dropdown and the entire chain closes.
                onActionDone={() => onSelect(item)}
              />
            );
        }
      }}
    />
  );
}
