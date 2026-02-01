/**
 * @file DropdownTrigger.test.tsx
 * @brief Unit tests for DropdownTrigger component
 */

import React from 'react';
import { render, screen, fireEvent } from '../test-utils/test-helpers';
import { DropdownTrigger, DropdownProvider } from '../index';
import { createMockDropdownContext } from '../test-utils/test-helpers';

describe('DropdownTrigger', () => {
  describe('Rendering', () => {
    it('renders with displayValue', () => {
      const mockContext = createMockDropdownContext();
      render(
        <DropdownProvider value={mockContext}>
          <DropdownTrigger displayValue="Selected Item" />
        </DropdownProvider>
      );

      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
      expect(screen.getByText('Selected Item')).toBeInTheDocument();
    });

    it('renders with placeholder when no displayValue', () => {
      const mockContext = createMockDropdownContext();
      render(
        <DropdownProvider value={mockContext}>
          <DropdownTrigger displayValue="" placeholder="Select an option" />
        </DropdownProvider>
      );

      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('renders with custom test id', () => {
      const mockContext = createMockDropdownContext();
      render(
        <DropdownProvider value={mockContext}>
          <DropdownTrigger displayValue="" data-testid="custom-trigger" />
        </DropdownProvider>
      );

      expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('calls toggleDropdown when clicked', () => {
      const mockContext = createMockDropdownContext();
      const toggleSpy = jest.fn();
      mockContext.toggleDropdown = toggleSpy;

      render(
        <DropdownProvider value={mockContext}>
          <DropdownTrigger displayValue="Test" />
        </DropdownProvider>
      );

      const trigger = screen.getByTestId('dropdown-trigger');
      fireEvent.click(trigger);

      expect(toggleSpy).toHaveBeenCalled();
    });

    it('does not call toggleDropdown when disabled', () => {
      const mockContext = createMockDropdownContext({ disabled: true });
      const toggleSpy = jest.fn();
      mockContext.toggleDropdown = toggleSpy;

      render(
        <DropdownProvider value={mockContext}>
          <DropdownTrigger displayValue="Test" />
        </DropdownProvider>
      );

      const trigger = screen.getByTestId('dropdown-trigger');
      fireEvent.click(trigger);

      expect(toggleSpy).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const mockContext = createMockDropdownContext();
      render(
        <DropdownProvider value={mockContext}>
          <DropdownTrigger displayValue="Test" />
        </DropdownProvider>
      );

      const trigger = screen.getByTestId('dropdown-trigger');
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('updates aria-expanded when open', () => {
      const mockContext = createMockDropdownContext({ isOpen: true });
      render(
        <DropdownProvider value={mockContext}>
          <DropdownTrigger displayValue="Test" />
        </DropdownProvider>
      );

      const trigger = screen.getByTestId('dropdown-trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
