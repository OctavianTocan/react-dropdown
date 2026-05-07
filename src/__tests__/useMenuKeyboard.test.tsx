/**
 * @file useMenuKeyboard.test.tsx
 * @brief Behavior tests for `useMenuKeyboard` — roving focus, type-ahead, edge traversal.
 */

import { renderHook, act } from "@testing-library/react";
import type { KeyboardEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { useMenuKeyboard, type UseMenuKeyboardOptions } from "../useMenuKeyboard";

interface MenuItem {
  id: string;
  label: string;
  disabled?: boolean;
}

const items: readonly MenuItem[] = [
  { id: "a", label: "Apple" },
  { id: "b", label: "Banana", disabled: true },
  { id: "c", label: "Cherry" },
  { id: "d", label: "Date" },
];

/** Stable accessors so renderHook re-renders don't invalidate the focus effect. */
const stableGetItemDisplay = (item: MenuItem) => item.label;
const stableGetItemDisabled = (item: MenuItem) => Boolean(item.disabled);

function makeOptions(overrides: Partial<UseMenuKeyboardOptions<MenuItem>> = {}) {
  return {
    items,
    isOpen: true,
    getItemDisplay: stableGetItemDisplay,
    getItemDisabled: stableGetItemDisabled,
    onActivate: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
}

/**
 * `renderHook` re-renders the hook with fresh closures by default, which
 * triggers the auto-focus effect (keyed on `items` / `getItemDisabled`) and
 * resets `focusedIndex` back to 0 mid-test. `renderStableHook` keeps the same
 * options object across renders so explicit focus moves stick.
 */
function renderStableHook(options: UseMenuKeyboardOptions<MenuItem>) {
  return renderHook(() => useMenuKeyboard(options));
}

/** Build a synthetic React keyboard event with just the surface useMenuKeyboard reads. */
function makeKeyEvent(key: string): KeyboardEvent {
  return {
    key,
    preventDefault: vi.fn(),
  } as unknown as KeyboardEvent;
}

describe("useMenuKeyboard", () => {
  describe("auto-focus on open", () => {
    it("focuses the first enabled item when the menu opens", () => {
      const { result } = renderStableHook(makeOptions());
      expect(result.current.focusedIndex).toBe(0); // 'Apple' (index 0 enabled)
    });

    it("skips disabled items at the start", () => {
      const overrides = makeOptions({
        items: [
          { id: "z", label: "Zebra", disabled: true },
          ...items,
        ],
      });
      const { result } = renderStableHook(overrides);
      // 'Zebra' is disabled at index 0, so focus skips to index 1 ('Apple')
      expect(result.current.focusedIndex).toBe(1);
    });

    it("resets focus to -1 when the menu closes", () => {
      const { result, rerender } = renderHook(
        (opts: UseMenuKeyboardOptions<MenuItem>) => useMenuKeyboard(opts),
        { initialProps: makeOptions() },
      );
      expect(result.current.focusedIndex).toBe(0);
      rerender(makeOptions({ isOpen: false }));
      expect(result.current.focusedIndex).toBe(-1);
    });
  });

  describe("arrow navigation", () => {
    it("ArrowDown moves to the next enabled item, skipping disabled", () => {
      const { result } = renderStableHook(makeOptions());
      expect(result.current.focusedIndex).toBe(0); // Apple
      act(() => result.current.handleKeyDown(makeKeyEvent("ArrowDown")));
      // Skip Banana (disabled), land on Cherry
      expect(result.current.focusedIndex).toBe(2);
    });

    it("ArrowUp wraps to the last enabled item", () => {
      const { result } = renderStableHook(makeOptions());
      expect(result.current.focusedIndex).toBe(0);
      act(() => result.current.handleKeyDown(makeKeyEvent("ArrowUp")));
      // Wraps from Apple (0) backward to Date (3)
      expect(result.current.focusedIndex).toBe(3);
    });

    it("ArrowDown wraps from last to first enabled", () => {
      const { result } = renderStableHook(makeOptions());
      act(() => result.current.handleKeyDown(makeKeyEvent("End")));
      expect(result.current.focusedIndex).toBe(3); // Date
      act(() => result.current.handleKeyDown(makeKeyEvent("ArrowDown")));
      expect(result.current.focusedIndex).toBe(0); // Apple — wrap to start
    });
  });

  describe("Home / End", () => {
    it("Home jumps to the first enabled item", () => {
      const { result } = renderStableHook(makeOptions());
      act(() => result.current.handleKeyDown(makeKeyEvent("End")));
      act(() => result.current.handleKeyDown(makeKeyEvent("Home")));
      expect(result.current.focusedIndex).toBe(0);
    });

    it("End jumps to the last enabled item", () => {
      const { result } = renderStableHook(makeOptions());
      act(() => result.current.handleKeyDown(makeKeyEvent("End")));
      expect(result.current.focusedIndex).toBe(3);
    });
  });

  describe("activation", () => {
    it("Enter calls onActivate with the focused item", () => {
      const onActivate = vi.fn();
      const { result } = renderStableHook(makeOptions({ onActivate }));
      act(() => result.current.handleKeyDown(makeKeyEvent("Enter")));
      expect(onActivate).toHaveBeenCalledWith(items[0]);
    });

    it("Space activates like Enter", () => {
      const onActivate = vi.fn();
      const { result } = renderStableHook(makeOptions({ onActivate }));
      act(() => result.current.handleKeyDown(makeKeyEvent(" ")));
      expect(onActivate).toHaveBeenCalledWith(items[0]);
    });

    it("Enter on a disabled item does nothing", () => {
      const onActivate = vi.fn();
      const { result } = renderStableHook(makeOptions({ onActivate }));
      // Manually focus the disabled Banana via setFocusedIndex
      act(() => result.current.setFocusedIndex(1));
      act(() => result.current.handleKeyDown(makeKeyEvent("Enter")));
      expect(onActivate).not.toHaveBeenCalled();
    });

    it("Escape calls onClose", () => {
      const onClose = vi.fn();
      const { result } = renderStableHook(makeOptions({ onClose }));
      act(() => result.current.handleKeyDown(makeKeyEvent("Escape")));
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  describe("type-ahead", () => {
    it("jumps focus to the item whose label starts with the typed key", () => {
      const { result } = renderStableHook(makeOptions());
      act(() => result.current.handleKeyDown(makeKeyEvent("c")));
      // 'c' matches 'Cherry' at index 2 (enabled)
      expect(result.current.focusedIndex).toBe(2);
    });

    it("appends keys within the buffer window", () => {
      const overrides = makeOptions({
        items: [
          { id: "ab", label: "Aardvark" },
          { id: "ap", label: "Apple" },
        ],
        getItemDisabled: undefined,
      });
      const { result } = renderStableHook(overrides);
      // Initial: 'a' → matches 'Aardvark' (first match at index 0)
      act(() => result.current.handleKeyDown(makeKeyEvent("a")));
      expect(result.current.focusedIndex).toBe(0);
      // 'p' (within buffer) → buffer 'ap' → matches 'Apple' at index 1
      act(() => result.current.handleKeyDown(makeKeyEvent("p")));
      expect(result.current.focusedIndex).toBe(1);
    });

    it("skips disabled items when matching", () => {
      const overrides = makeOptions({
        items: [
          { id: "ban1", label: "Banana", disabled: true },
          { id: "ban2", label: "Banoffee" },
        ],
      });
      const { result } = renderStableHook(overrides);
      // First enabled item is Banoffee at index 1
      act(() => result.current.handleKeyDown(makeKeyEvent("b")));
      expect(result.current.focusedIndex).toBe(1);
    });

    it("does nothing when no item matches", () => {
      const { result } = renderStableHook(makeOptions());
      const before = result.current.focusedIndex;
      act(() => result.current.handleKeyDown(makeKeyEvent("z")));
      expect(result.current.focusedIndex).toBe(before);
    });
  });

  describe("getItemTabIndex", () => {
    it("returns 0 for the focused item, -1 otherwise", () => {
      const { result } = renderStableHook(makeOptions());
      expect(result.current.getItemTabIndex(0)).toBe(0); // focused
      expect(result.current.getItemTabIndex(1)).toBe(-1); // not focused
      expect(result.current.getItemTabIndex(2)).toBe(-1);
    });
  });

  describe("disabled menu (closed)", () => {
    it("ignores key presses when isOpen is false", () => {
      const onActivate = vi.fn();
      const onClose = vi.fn();
      const { result } = renderHook(() =>
        useMenuKeyboard(makeOptions({ isOpen: false, onActivate, onClose })),
      );
      act(() => result.current.handleKeyDown(makeKeyEvent("Enter")));
      act(() => result.current.handleKeyDown(makeKeyEvent("Escape")));
      act(() => result.current.handleKeyDown(makeKeyEvent("ArrowDown")));
      expect(onActivate).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
