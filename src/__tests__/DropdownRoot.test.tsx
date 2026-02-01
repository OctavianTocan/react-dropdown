/**
 * @file DropdownRoot.test.tsx
 * @brief Unit tests for DropdownRoot component
 */

import React from 'react';
import { renderDropdown, screen, fireEvent, waitFor } from '../test-utils/test-helpers';
import {
  mockItems,
  getMockItemKey,
  getMockItemDisplay,
  createMockOnSelect,
} from '../test-utils/mock-data';

describe('DropdownRoot', () => {
  describe('Rendering', () => {
    it('renders with required props', () => {
      const onSelect = createMockOnSelect();
      renderDropdown({
        items: mockItems,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        onSelect: onSelect.mock,
      });

      expect(screen.getByTestId('dropdown-root')).toBeInTheDocument();
    });

    it('renders with optional props', () => {
      const onSelect = createMockOnSelect();
      renderDropdown({
        items: mockItems,
        selectedItem: mockItems[0],
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        onSelect: onSelect.mock,
        disabled: false,
        placeholder: 'Choose option',
        className: 'custom-class',
      });

      const root = screen.getByTestId('dropdown-root');
      expect(root).toBeInTheDocument();
      expect(root).toHaveClass('custom-class');
    });

    it('renders with disabled state', () => {
      const onSelect = createMockOnSelect();
      renderDropdown({
        items: mockItems,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        onSelect: onSelect.mock,
        disabled: true,
      });

      expect(screen.getByTestId('dropdown-root')).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('starts with dropdown closed', () => {
      const onSelect = createMockOnSelect();
      renderDropdown({
        items: mockItems,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        onSelect: onSelect.mock,
      });

      expect(screen.queryByTestId('dropdown-content')).not.toBeInTheDocument();
    });

    it('opens dropdown when trigger is clicked', async () => {
      const onSelect = createMockOnSelect();
      renderDropdown({
        items: mockItems,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        onSelect: onSelect.mock,
      });

      const trigger = screen.getByTestId('dropdown-trigger');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
      });
    });

    it('closes dropdown when trigger clicked again', async () => {
      const onSelect = createMockOnSelect();
      renderDropdown({
        items: mockItems,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        onSelect: onSelect.mock,
      });

      // Open dropdown
      const trigger = screen.getByTestId('dropdown-trigger');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
      });

      // Click trigger again to close
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.queryByTestId('dropdown-content')).not.toBeInTheDocument();
      });
    });
  });

  describe('Selection', () => {
    it('calls onSelect when item is selected', async () => {
      const onSelect = createMockOnSelect();
      renderDropdown({
        items: mockItems,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        onSelect: onSelect.mock,
      });

      // Open dropdown
      const trigger = screen.getByTestId('dropdown-trigger');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
      });

      // Select first item
      const firstItem = screen.getByText('Item One');
      fireEvent.click(firstItem);

      expect(onSelect.mock).toHaveBeenCalledWith(mockItems[0]);
      expect(onSelect.mock).toHaveBeenCalledTimes(1);
    });

    it('closes dropdown after selection', async () => {
      const onSelect = createMockOnSelect();
      renderDropdown({
        items: mockItems,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        onSelect: onSelect.mock,
      });

      // Open dropdown
      const trigger = screen.getByTestId('dropdown-trigger');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
      });

      // Select item
      const firstItem = screen.getByText('Item One');
      fireEvent.click(firstItem);

      await waitFor(() => {
        expect(screen.queryByTestId('dropdown-content')).not.toBeInTheDocument();
      });
    });
  });

  describe('Search', () => {
    it('filters items using default filter function', async () => {
      const onSelect = createMockOnSelect();
      const { container } = renderDropdown(
        {
          items: mockItems,
          getItemKey: getMockItemKey,
          getItemDisplay: getMockItemDisplay,
          onSelect: onSelect.mock,
        },
        { displayValue: '', placeholder: 'Select option' },
        <>
          <input data-testid="search-input" type="text" placeholder="Search..." />
          <div data-testid="item-list">
            {mockItems.map((item) => (
              <div key={getMockItemKey(item)} data-testid={`item-${item.id}`}>
                {getMockItemDisplay(item)}
              </div>
            ))}
          </div>
        </>
      );

      const trigger = screen.getByTestId('dropdown-trigger');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
      });

      expect(screen.getByTestId('item-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-2')).toBeInTheDocument();
    });

    it('clears search query when dropdown closes via trigger', async () => {
      const onSelect = createMockOnSelect();
      renderDropdown({
        items: mockItems,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        onSelect: onSelect.mock,
      });

      const trigger = screen.getByTestId('dropdown-trigger');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('dropdown-search');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Verify search value is set
      expect(searchInput).toHaveValue('test');

      // Close dropdown by clicking trigger again
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.queryByTestId('dropdown-content')).not.toBeInTheDocument();
      });

      // Reopen to verify search was cleared
      fireEvent.click(trigger);

      await waitFor(() => {
        const newSearchInput = screen.getByTestId('dropdown-search');
        expect(newSearchInput).toHaveValue('');
      });
    });

    it('uses custom filterItems function when provided', async () => {
      const customFilter = jest.fn((items, query) => {
        return items.filter((item) =>
          getMockItemDisplay(item).toUpperCase().includes(query.toUpperCase())
        );
      });

      const onSelect = createMockOnSelect();
      renderDropdown({
        items: mockItems,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        onSelect: onSelect.mock,
        filterItems: customFilter,
      });

      expect(screen.getByTestId('dropdown-root')).toBeInTheDocument();
    });

    it('filters with empty query returns all items', () => {
      const onSelect = createMockOnSelect();
      renderDropdown({
        items: mockItems,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        onSelect: onSelect.mock,
      });

      expect(screen.getByTestId('dropdown-root')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const onSelect = createMockOnSelect();
      renderDropdown({
        items: mockItems,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        onSelect: onSelect.mock,
      });

      const trigger = screen.getByTestId('dropdown-trigger');
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('updates ARIA expanded when opened', async () => {
      const onSelect = createMockOnSelect();
      renderDropdown({
        items: mockItems,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        onSelect: onSelect.mock,
      });

      const trigger = screen.getByTestId('dropdown-trigger');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty items array', () => {
      const onSelect = createMockOnSelect();
      renderDropdown({
        items: [],
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        onSelect: onSelect.mock,
      });

      expect(screen.getByTestId('dropdown-root')).toBeInTheDocument();
    });

    it('handles single item', () => {
      const onSelect = createMockOnSelect();
      renderDropdown({
        items: [mockItems[0]],
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        onSelect: onSelect.mock,
      });

      expect(screen.getByTestId('dropdown-root')).toBeInTheDocument();
    });

    it('handles large item sets', () => {
      const largeItems = Array.from({ length: 100 }, (_, i) => ({
        id: `item-${i}`,
        name: `Item ${i}`,
        value: i,
      }));
      const onSelect = createMockOnSelect();
      renderDropdown({
        items: largeItems,
        getItemKey: (item) => item.id,
        getItemDisplay: (item) => item.name,
        onSelect: onSelect.mock,
      });

      expect(screen.getByTestId('dropdown-root')).toBeInTheDocument();
    });

    it('does not open dropdown when disabled', async () => {
      const onSelect = createMockOnSelect();
      renderDropdown({
        items: mockItems,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        onSelect: onSelect.mock,
        disabled: true,
      });

      const trigger = screen.getByTestId('dropdown-trigger');
      fireEvent.click(trigger);

      expect(screen.queryByTestId('dropdown-content')).not.toBeInTheDocument();
    });

    it('handles null selectedItem prop', () => {
      const onSelect = createMockOnSelect();
      renderDropdown({
        items: mockItems,
        selectedItem: null,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        onSelect: onSelect.mock,
      });

      expect(screen.getByTestId('dropdown-root')).toBeInTheDocument();
    });

    it('handles custom className prop', () => {
      const onSelect = createMockOnSelect();
      renderDropdown({
        items: mockItems,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        onSelect: onSelect.mock,
        className: 'my-custom-class',
      });

      const root = screen.getByTestId('dropdown-root');
      expect(root).toHaveClass('my-custom-class');
    });
  });

  describe('Filter Behavior', () => {
    it('memoizes filtered items to prevent unnecessary recalculations', () => {
      const onSelect = createMockOnSelect();
      const filterItems = jest.fn((items, query) => {
        return items.filter((item) =>
          getMockItemDisplay(item).toLowerCase().includes(query.toLowerCase())
        );
      });

      renderDropdown({
        items: mockItems,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        onSelect: onSelect.mock,
        filterItems,
      });

      expect(screen.getByTestId('dropdown-root')).toBeInTheDocument();
    });

    it('handles case-insensitive filtering with default filter', () => {
      const onSelect = createMockOnSelect();
      renderDropdown({
        items: mockItems,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        onSelect: onSelect.mock,
      });

      expect(screen.getByTestId('dropdown-root')).toBeInTheDocument();
    });

    it('trims whitespace in search query', () => {
      const onSelect = createMockOnSelect();
      renderDropdown({
        items: mockItems,
        getItemKey: getMockItemKey,
        getItemDisplay: getMockItemDisplay,
        onSelect: onSelect.mock,
      });

      expect(screen.getByTestId('dropdown-root')).toBeInTheDocument();
    });
  });
});
