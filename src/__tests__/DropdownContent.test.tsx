/**
 * @file DropdownContent.test.tsx
 * @brief Unit tests for DropdownContent component
 */

import React from 'react';
import { render, screen } from '../test-utils/test-helpers';
import { DropdownContent, DropdownProvider } from '../index';
import { createMockDropdownContext } from '../test-utils/test-helpers';

describe('DropdownContent', () => {
  describe('Rendering', () => {
    it('renders children when open', () => {
      const mockContext = createMockDropdownContext({ isOpen: true });
      render(
        <DropdownProvider value={mockContext}>
          <DropdownContent>
            <div data-testid="child">Child Content</div>
          </DropdownContent>
        </DropdownProvider>
      );

      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      const mockContext = createMockDropdownContext({ isOpen: false });
      render(
        <DropdownProvider value={mockContext}>
          <DropdownContent>
            <div data-testid="child">Child Content</div>
          </DropdownContent>
        </DropdownProvider>
      );

      expect(screen.queryByTestId('dropdown-content')).not.toBeInTheDocument();
    });

    it('renders with custom test id', () => {
      const mockContext = createMockDropdownContext({ isOpen: true });
      render(
        <DropdownProvider value={mockContext}>
          <DropdownContent data-testid="custom-content">
            <div>Content</div>
          </DropdownContent>
        </DropdownProvider>
      );

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });
  });

  describe('Placement', () => {
    it('applies bottom placement classes by default', () => {
      const mockContext = createMockDropdownContext({ isOpen: true, dropdownPlacement: 'bottom' });
      render(
        <DropdownProvider value={mockContext}>
          <DropdownContent>
            <div>Content</div>
          </DropdownContent>
        </DropdownProvider>
      );

      const content = screen.getByTestId('dropdown-content');
      expect(content).toHaveClass('mt-1');
      expect(content).toHaveClass('flex-col');
    });

    it('applies top placement classes when specified', () => {
      const mockContext = createMockDropdownContext({ isOpen: true, dropdownPlacement: 'top' });
      render(
        <DropdownProvider value={mockContext}>
          <DropdownContent>
            <div>Content</div>
          </DropdownContent>
        </DropdownProvider>
      );

      const content = screen.getByTestId('dropdown-content');
      expect(content).toHaveClass('bottom-full');
      expect(content).toHaveClass('mb-1');
      expect(content).toHaveClass('flex-col-reverse');
    });
  });
});
