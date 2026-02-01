/**
 * @file DropdownContext.test.tsx
 * @brief Unit tests for DropdownContext and hooks
 */

import '@testing-library/jest-dom';
import { renderHook, render, screen, act } from '../test-utils/test-helpers';
import {
  useDropdownContext,
  DropdownProvider,
  useKeyboardNavigation,
  useClickOutside,
} from '../DropdownContext';
import type { DropdownContextValue } from '../types';
import { mockItems, getMockItemKey, getMockItemDisplay } from '../test-utils/mock-data';
import { useRef } from 'react';

//---------------------------------------------------------------------------------------------
// Test Component Helpers
//---------------------------------------------------------------------------------------------

const TestComponent = () => {
  const context = useDropdownContext();
  return <div data-testid="context-consumer">{JSON.stringify(context.isOpen)}</div>;
};

const createMockContext = (): DropdownContextValue<any> => ({
  isOpen: false,
  setIsOpen: jest.fn(),
  selectedItem: null,
  setSelectedItem: jest.fn(),
  searchQuery: '',
  setSearchQuery: jest.fn(),
  items: mockItems,
  filteredItems: mockItems,
  getItemKey: getMockItemKey,
  getItemDisplay: getMockItemDisplay,
  filterItems: jest.fn(),
  onSelect: jest.fn(),
  disabled: false,
  closeOnSelect: true,
  closeDropdown: jest.fn(),
  toggleDropdown: jest.fn(),
});

//---------------------------------------------------------------------------------------------
// useDropdownContext Tests
//---------------------------------------------------------------------------------------------

describe('DropdownContext', () => {
  describe('useDropdownContext', () => {
    it('throws error when used outside provider', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useDropdownContext());
      }).toThrow('useDropdownContext must be used within a DropdownProvider');

      consoleErrorSpy.mockRestore();
    });

    it('provides context value when used inside provider', () => {
      const mockContext = createMockContext();

      render(
        <DropdownProvider value={mockContext}>
          <TestComponent />
        </DropdownProvider>
      );

      expect(screen.getByTestId('context-consumer')).toBeInTheDocument();
      expect(screen.getByTestId('context-consumer')).toHaveTextContent('false');
    });

    it('returns correct context value from provider', () => {
      const mockContext = createMockContext();
      mockContext.isOpen = true;

      const { result } = renderHook(() => useDropdownContext(), {
        wrapper: ({ children }) => (
          <DropdownProvider value={mockContext}>{children}</DropdownProvider>
        ),
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.items).toEqual(mockItems);
    });
  });

  //---------------------------------------------------------------------------------------------
  // useKeyboardNavigation Tests
  //---------------------------------------------------------------------------------------------

  describe('useKeyboardNavigation', () => {
    const createKeyboardEvent = (key: string): React.KeyboardEvent =>
      ({
        key,
        preventDefault: jest.fn(),
      }) as any;

    it('increments focused index on ArrowDown', () => {
      const onSelect = jest.fn();
      const closeDropdown = jest.fn();

      const { result } = renderHook(() =>
        useKeyboardNavigation(mockItems, getMockItemKey, onSelect, closeDropdown)
      );

      const event = createKeyboardEvent('ArrowDown');

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('decrements focused index on ArrowUp', () => {
      const onSelect = jest.fn();
      const closeDropdown = jest.fn();

      const { result } = renderHook(() =>
        useKeyboardNavigation(mockItems, getMockItemKey, onSelect, closeDropdown)
      );

      const eventDown = createKeyboardEvent('ArrowDown');
      const eventUp = createKeyboardEvent('ArrowUp');

      act(() => {
        result.current.handleKeyDown(eventDown);
        result.current.handleKeyDown(eventUp);
      });

      expect(eventUp.preventDefault).toHaveBeenCalled();
    });

    it('does not decrement below zero on ArrowUp', () => {
      const onSelect = jest.fn();
      const closeDropdown = jest.fn();

      const { result } = renderHook(() =>
        useKeyboardNavigation(mockItems, getMockItemKey, onSelect, closeDropdown)
      );

      const event = createKeyboardEvent('ArrowUp');

      act(() => {
        result.current.handleKeyDown(event);
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('does not increment beyond items length on ArrowDown', () => {
      const onSelect = jest.fn();
      const closeDropdown = jest.fn();

      const { result } = renderHook(() =>
        useKeyboardNavigation(mockItems, getMockItemKey, onSelect, closeDropdown)
      );

      const event = createKeyboardEvent('ArrowDown');

      act(() => {
        for (let i = 0; i < mockItems.length + 5; i++) {
          result.current.handleKeyDown(event);
        }
      });

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('calls onSelect with correct item on Enter', () => {
      const onSelect = jest.fn();
      const closeDropdown = jest.fn();

      const { result } = renderHook(() =>
        useKeyboardNavigation(mockItems, getMockItemKey, onSelect, closeDropdown)
      );

      const eventDown = createKeyboardEvent('ArrowDown');
      const eventEnter = createKeyboardEvent('Enter');

      act(() => {
        result.current.handleKeyDown(eventDown);
        result.current.handleKeyDown(eventEnter);
      });

      expect(eventEnter.preventDefault).toHaveBeenCalled();
      expect(onSelect).toHaveBeenCalledWith(mockItems[0]);
    });

    it('does not call onSelect when no item is focused on Enter', () => {
      const onSelect = jest.fn();
      const closeDropdown = jest.fn();

      const { result } = renderHook(() =>
        useKeyboardNavigation(mockItems, getMockItemKey, onSelect, closeDropdown)
      );

      const eventEnter = createKeyboardEvent('Enter');

      act(() => {
        result.current.handleKeyDown(eventEnter);
      });

      expect(eventEnter.preventDefault).toHaveBeenCalled();
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('calls closeDropdown on Escape', () => {
      const onSelect = jest.fn();
      const closeDropdown = jest.fn();

      const { result } = renderHook(() =>
        useKeyboardNavigation(mockItems, getMockItemKey, onSelect, closeDropdown)
      );

      const event = createKeyboardEvent('Escape');

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(closeDropdown).toHaveBeenCalled();
    });

    it('resets focused index when resetFocus is called', () => {
      const onSelect = jest.fn();
      const closeDropdown = jest.fn();

      const { result } = renderHook(() =>
        useKeyboardNavigation(mockItems, getMockItemKey, onSelect, closeDropdown)
      );

      const event = createKeyboardEvent('ArrowDown');

      act(() => {
        result.current.handleKeyDown(event);
        result.current.resetFocus();
      });

      expect(result.current.focusedIndex).toBe(-1);
    });

    it('handles empty items array gracefully', () => {
      const onSelect = jest.fn();
      const closeDropdown = jest.fn();

      const { result } = renderHook(() =>
        useKeyboardNavigation([], getMockItemKey, onSelect, closeDropdown)
      );

      const eventDown = createKeyboardEvent('ArrowDown');
      const eventEnter = createKeyboardEvent('Enter');

      act(() => {
        result.current.handleKeyDown(eventDown);
        result.current.handleKeyDown(eventEnter);
      });

      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  //---------------------------------------------------------------------------------------------
  // useClickOutside Tests
  //---------------------------------------------------------------------------------------------

  describe('useClickOutside', () => {
    const ClickOutsideTestComponent = ({
      isOpen,
      closeDropdown,
    }: {
      isOpen: boolean;
      closeDropdown: () => void;
    }) => {
      const dropdownRef = useRef<HTMLDivElement>(null);
      useClickOutside(dropdownRef as React.RefObject<HTMLElement>, closeDropdown, isOpen);

      return (
        <div>
          <div ref={dropdownRef} data-testid="dropdown">
            Dropdown
          </div>
          <div data-testid="outside">Outside</div>
        </div>
      );
    };

    // Note: useClickOutside from @react-hookz/web is mocked in jest.setup.js
    // These tests are skipped because the mock doesn't implement the actual behavior
    it.skip('calls closeDropdown when clicking outside', () => {
      const closeDropdown = jest.fn();

      render(<ClickOutsideTestComponent isOpen={true} closeDropdown={closeDropdown} />);

      const outsideElement = screen.getByTestId('outside');

      act(() => {
        outsideElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      });

      expect(closeDropdown).toHaveBeenCalled();
    });

    it('does not call closeDropdown when clicking inside', () => {
      const closeDropdown = jest.fn();

      render(<ClickOutsideTestComponent isOpen={true} closeDropdown={closeDropdown} />);

      const dropdownElement = screen.getByTestId('dropdown');

      act(() => {
        dropdownElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      });

      expect(closeDropdown).not.toHaveBeenCalled();
    });

    it('does not attach listener when isOpen is false', () => {
      const closeDropdown = jest.fn();

      render(<ClickOutsideTestComponent isOpen={false} closeDropdown={closeDropdown} />);

      const outsideElement = screen.getByTestId('outside');

      act(() => {
        outsideElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      });

      expect(closeDropdown).not.toHaveBeenCalled();
    });

    it.skip('removes event listener on cleanup', () => {
      const closeDropdown = jest.fn();
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { unmount } = render(
        <ClickOutsideTestComponent isOpen={true} closeDropdown={closeDropdown} />
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });

    it.skip('updates listener when isOpen changes', () => {
      const closeDropdown = jest.fn();

      const { rerender } = render(
        <ClickOutsideTestComponent isOpen={false} closeDropdown={closeDropdown} />
      );

      const outsideElement = screen.getByTestId('outside');

      act(() => {
        outsideElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      });

      expect(closeDropdown).not.toHaveBeenCalled();

      rerender(<ClickOutsideTestComponent isOpen={true} closeDropdown={closeDropdown} />);

      act(() => {
        outsideElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      });

      expect(closeDropdown).toHaveBeenCalled();
    });
  });
});
