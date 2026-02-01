/**
 * @file DropdownSearch.test.tsx
 * @brief Unit tests for DropdownSearch component
 */

import React from 'react';
import { render, screen, fireEvent } from '../test-utils/test-helpers';
import { DropdownSearch, DropdownProvider } from '../index';
import { createMockDropdownContext } from '../test-utils/test-helpers';

describe('DropdownSearch', () => {
  describe('Rendering', () => {
    it('renders search input', () => {
      const mockContext = createMockDropdownContext();
      render(
        <DropdownProvider value={mockContext}>
          <DropdownSearch value="" onChange={() => {}} />
        </DropdownProvider>
      );

      expect(screen.getByTestId('dropdown-search')).toBeInTheDocument();
    });

    it('displays placeholder text', () => {
      const mockContext = createMockDropdownContext();
      render(
        <DropdownProvider value={mockContext}>
          <DropdownSearch value="" onChange={() => {}} placeholder="Search items..." />
        </DropdownProvider>
      );

      expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
    });

    it('displays current value', () => {
      const mockContext = createMockDropdownContext();
      render(
        <DropdownProvider value={mockContext}>
          <DropdownSearch value="test query" onChange={() => {}} />
        </DropdownProvider>
      );

      const input = screen.getByTestId('dropdown-search') as HTMLInputElement;
      expect(input.value).toBe('test query');
    });
  });

  describe('Interaction', () => {
    it('calls onChange when input changes', () => {
      const mockContext = createMockDropdownContext();
      const handleChange = jest.fn();

      render(
        <DropdownProvider value={mockContext}>
          <DropdownSearch value="" onChange={handleChange} />
        </DropdownProvider>
      );

      const input = screen.getByTestId('dropdown-search');
      fireEvent.change(input, { target: { value: 'new query' } });

      expect(handleChange).toHaveBeenCalledWith('new query');
    });
  });
});
