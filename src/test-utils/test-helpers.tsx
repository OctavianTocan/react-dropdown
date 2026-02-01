/**
 * @file test-helpers.tsx
 * @brief Shared testing utilities for dropdown component suite
 */

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import type { DropdownContextValue, DropdownRootProps, DropdownTriggerProps } from '../types';
import { DropdownRoot } from '../DropdownRoot';
import { DropdownTrigger } from '../DropdownTrigger';
import { DropdownContent } from '../DropdownContent';
import { DropdownSearchable } from '../DropdownSearchable';
import { DropdownSimple } from '../DropdownSimple';

// --- INTERNAL TYPES --- //
// WHY: Simplify helper signatures and keep configuration extensible.
type TriggerOverrides = Partial<DropdownTriggerProps>;

type DropdownVariant = 'searchable' | 'simple' | 'custom';

interface RenderDropdownOptions {
  /** Selects which dropdown helper to render within DropdownRoot */
  dropdownVariant?: DropdownVariant;
  /** Placeholder to apply when using the searchable dropdown helper */
  searchPlaceholder?: string;
}

// --- CUSTOM RENDERER --- //
// WHY: Centralise provider wiring to keep tests concise.
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
  const Wrapper = ({ children }: { children: ReactNode }) => <>{children}</>;
  return render(ui, { wrapper: Wrapper, ...options });
};

const createNoop = <Fn extends (...args: any[]) => any>(): Fn => {
  return ((..._args: Parameters<Fn>) => undefined) as Fn;
};

// --- DROPDOWN RENDERING HELPERS --- //
// WHY: Compose common dropdown configurations for behavioural tests.
export const renderDropdown = <T,>(
  props: DropdownRootProps<T>,
  triggerOverrides?: TriggerOverrides,
  dropdownChildren?: ReactNode,
  options: RenderDropdownOptions = {}
) => {
  const resolvedProps: DropdownRootProps<T> = {
    ...props,
    selectedItem: props.selectedItem ?? null,
    disabled: props.disabled ?? false,
    placeholder: props.placeholder ?? 'Select an option',
    className: props.className ?? '',
  };

  const { dropdownVariant = dropdownChildren ? 'custom' : 'searchable', searchPlaceholder } =
    options;

  const {
    displayValue = '',
    placeholder: triggerPlaceholder,
    ...triggerRest
  } = triggerOverrides ?? {};

  const resolveDropdown = () => {
    if (dropdownVariant === 'simple') {
      return <DropdownSimple data-testid="dropdown-content" />;
    }

    if (dropdownVariant === 'custom') {
      return <DropdownContent>{dropdownChildren}</DropdownContent>;
    }

    return (
      <DropdownSearchable searchPlaceholder={searchPlaceholder} data-testid="dropdown-content" />
    );
  };

  return customRender(
    <DropdownRoot {...resolvedProps}>
      <DropdownTrigger
        displayValue={displayValue}
        placeholder={triggerPlaceholder ?? resolvedProps.placeholder ?? 'Select an option'}
        {...triggerRest}
      />
      {resolveDropdown()}
    </DropdownRoot>
  );
};

// --- CONTEXT FACTORY --- //
// WHY: Create strongly typed dropdown contexts with targeted overrides.
export const createMockDropdownContext = <T,>(
  overrides: Partial<DropdownContextValue<T>> = {}
): DropdownContextValue<T> => {
  const defaultFilter: DropdownContextValue<T>['filterItems'] = (items) => items;
  return {
    isOpen: overrides.isOpen ?? false,
    setIsOpen: overrides.setIsOpen ?? createNoop<DropdownContextValue<T>['setIsOpen']>(),
    selectedItem: overrides.selectedItem ?? null,
    setSelectedItem:
      overrides.setSelectedItem ?? createNoop<DropdownContextValue<T>['setSelectedItem']>(),
    searchQuery: overrides.searchQuery ?? '',
    setSearchQuery:
      overrides.setSearchQuery ?? createNoop<DropdownContextValue<T>['setSearchQuery']>(),
    items: overrides.items ?? [],
    filteredItems: overrides.filteredItems ?? overrides.items ?? [],
    getItemKey: overrides.getItemKey ?? ((() => '') as DropdownContextValue<T>['getItemKey']),
    getItemDisplay:
      overrides.getItemDisplay ?? ((() => '') as DropdownContextValue<T>['getItemDisplay']),
    filterItems: overrides.filterItems ?? defaultFilter,
    onSelect: overrides.onSelect ?? createNoop<DropdownContextValue<T>['onSelect']>(),
    disabled: overrides.disabled ?? false,
    closeOnSelect: overrides.closeOnSelect ?? true,
    closeDropdown:
      overrides.closeDropdown ?? createNoop<DropdownContextValue<T>['closeDropdown']>(),
    toggleDropdown:
      overrides.toggleDropdown ?? createNoop<DropdownContextValue<T>['toggleDropdown']>(),
    dropdownPlacement: overrides.dropdownPlacement ?? 'bottom',
    getItemDescription: overrides.getItemDescription,
    getItemIcon: overrides.getItemIcon,
    getItemSection: overrides.getItemSection,
    getItemSeparator: overrides.getItemSeparator,
    getItemDisabled: overrides.getItemDisabled,
    getItemClassName: overrides.getItemClassName,
  };
};

// --- MISCELLANEOUS TEST HELPERS --- //
// WHY: Utility helpers keep tests expressive without repetition.
export const createMockFunction = <Args extends any[], Result>() => {
  return jest.fn() as jest.Mock<Result, Args>;
};

export const waitForNextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

export const getTestId = (id: string) => `[data-testid="${id}"]`;

// --- RE-EXPORTS --- //
// WHY: Allow tests to import everything from a single helper entry point.
export * from '@testing-library/react';
export * from '@testing-library/user-event';
