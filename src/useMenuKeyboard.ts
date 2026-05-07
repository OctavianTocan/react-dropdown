/**
 * @file useMenuKeyboard.ts
 * @brief Keyboard interaction hook for action-menu dropdowns
 *
 * Adds roving tabindex, type-ahead jumping, and Home/End traversal on top of
 * the dropdown's basic Arrow / Enter / Escape handling — the keyboard surface
 * Radix's `DropdownMenu` provides out of the box.
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** Time (ms) the type-ahead buffer stays warm before resetting on idle. */
const TYPEAHEAD_RESET_MS = 500;

/** Result of {@link useMenuKeyboard}, suitable for spreading onto an action menu. */
export interface MenuKeyboardApi {
  /** Index of the currently focused item, or -1 when nothing is focused. */
  focusedIndex: number;
  /**
   * Handler to attach to the menu container's `onKeyDown`. Manages
   * ArrowUp/Down (with wrap), Home/End, Enter (activate), Escape (close), and
   * alphanumeric type-ahead. Returns nothing — the implementation calls
   * `event.preventDefault()` on keys it consumes.
   */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /**
   * Resolves the `tabIndex` for an item at the given index. Returns `0` for
   * the focused item and `-1` for everything else, so Tab leaves the menu
   * naturally and arrow keys are the in-menu traversal mechanism.
   */
  getItemTabIndex: (index: number) => number;
  /** Updates the internally tracked focus index, e.g. on hover. */
  setFocusedIndex: (index: number) => void;
}

/**
 * @brief Resolve the disabled state for an item; defaults to "enabled" when no
 * accessor is provided.
 */
function isItemDisabled<T>(item: T, getItemDisabled?: (item: T) => boolean): boolean {
  return Boolean(getItemDisabled?.(item));
}

/**
 * @brief Find the next selectable index in a direction, skipping disabled items
 *
 * @param items Item array
 * @param fromIndex Current focus index
 * @param direction `1` for forward, `-1` for backward
 * @param getItemDisabled Optional disabled accessor
 * @returns Next focusable index, wrapping around; `-1` if no item is enabled
 */
function findNextEnabled<T>(
  items: readonly T[],
  fromIndex: number,
  direction: 1 | -1,
  getItemDisabled?: (item: T) => boolean,
): number {
  if (items.length === 0) return -1;
  for (let step = 1; step <= items.length; step++) {
    const candidate = (fromIndex + direction * step + items.length) % items.length;
    const item = items[candidate];
    if (item !== undefined && !isItemDisabled(item, getItemDisabled)) {
      return candidate;
    }
  }
  return -1;
}

/**
 * @brief Find the first/last enabled index, skipping disabled items
 *
 * @param items Item array
 * @param edge `'first'` or `'last'`
 * @param getItemDisabled Optional disabled accessor
 * @returns Index of the first or last focusable item; `-1` if none
 */
function findEdgeEnabled<T>(
  items: readonly T[],
  edge: "first" | "last",
  getItemDisabled?: (item: T) => boolean,
): number {
  const range =
    edge === "first" ? items.map((_, i) => i) : items.map((_, i) => items.length - 1 - i);
  for (const i of range) {
    const item = items[i];
    if (item !== undefined && !isItemDisabled(item, getItemDisabled)) {
      return i;
    }
  }
  return -1;
}

/** Inputs to {@link useMenuKeyboard}. */
export interface UseMenuKeyboardOptions<T> {
  /** Items in the menu, in display order. */
  items: readonly T[];
  /** Whether the menu is currently open — controls auto-focus on the first item. */
  isOpen: boolean;
  /** Resolves the display label used for type-ahead matching. */
  getItemDisplay: (item: T) => string;
  /** Called when the user activates an item via Enter or type-ahead-then-Enter. */
  onActivate: (item: T) => void;
  /** Called when the user presses Escape. */
  onClose: () => void;
  /** Optional disabled accessor; disabled items are skipped during traversal. */
  getItemDisabled?: (item: T) => boolean;
}

/**
 * @brief Action-menu keyboard interaction hook
 *
 * Wires ArrowUp/Down, Home/End, Enter, Escape, and alphanumeric type-ahead
 * onto an action-style menu. Mirrors the keyboard surface that Radix's
 * `DropdownMenu` provides:
 *
 * - **ArrowDown / ArrowUp** — move focus to the next/previous enabled item,
 *   wrapping at the ends.
 * - **Home / End** — jump to the first / last enabled item.
 * - **Enter / Space** — activate the focused item.
 * - **Escape** — close the menu.
 * - **Alphanumeric** — append to a 500 ms type-ahead buffer and jump focus to
 *   the first item whose display text starts with the buffer (case-insensitive).
 *
 * The hook does NOT call `.focus()` on items itself — consumers that render
 * one focusable element per item (e.g. `<button>` action rows) should give
 * each item a `data-key` attribute keyed off the item's stable id and a
 * `tabIndex` derived from {@link MenuKeyboardApi.getItemTabIndex}, then call
 * `.focus()` in their own effect when `focusedIndex` changes. See
 * `DropdownMenu` for the wiring used by this package's built-in renderers.
 *
 * @param options Item array, open state, and callbacks
 * @returns Roving-tabindex API to spread onto the menu
 */
export function useMenuKeyboard<T>(options: UseMenuKeyboardOptions<T>): MenuKeyboardApi {
  const { items, isOpen, getItemDisplay, onActivate, onClose, getItemDisabled } = options;

  const [focusedIndex, setFocusedIndex] = useState(-1);
  const typeaheadBufferRef = useRef("");
  const typeaheadTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // When the menu opens, focus the first enabled item so keyboard users see a
  // live cursor without first pressing arrow-down. When it closes, reset.
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(findEdgeEnabled(items, "first", getItemDisabled));
    } else {
      setFocusedIndex(-1);
      typeaheadBufferRef.current = "";
      if (typeaheadTimerRef.current) clearTimeout(typeaheadTimerRef.current);
    }
  }, [isOpen, items, getItemDisabled]);

  /** Schedules a reset of the type-ahead buffer after `TYPEAHEAD_RESET_MS`. */
  const scheduleTypeaheadReset = useCallback((): void => {
    if (typeaheadTimerRef.current) clearTimeout(typeaheadTimerRef.current);
    typeaheadTimerRef.current = setTimeout(() => {
      typeaheadBufferRef.current = "";
    }, TYPEAHEAD_RESET_MS);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent): void => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowDown": {
          event.preventDefault();
          setFocusedIndex(findNextEnabled(items, focusedIndex, 1, getItemDisabled));
          return;
        }
        case "ArrowUp": {
          event.preventDefault();
          setFocusedIndex(findNextEnabled(items, focusedIndex, -1, getItemDisabled));
          return;
        }
        case "Home": {
          event.preventDefault();
          setFocusedIndex(findEdgeEnabled(items, "first", getItemDisabled));
          return;
        }
        case "End": {
          event.preventDefault();
          setFocusedIndex(findEdgeEnabled(items, "last", getItemDisabled));
          return;
        }
        case "Enter":
        case " ": {
          event.preventDefault();
          const target = items[focusedIndex];
          if (target !== undefined && !isItemDisabled(target, getItemDisabled)) {
            onActivate(target);
          }
          return;
        }
        case "Escape": {
          event.preventDefault();
          onClose();
          return;
        }
      }

      // Alphanumeric type-ahead — anything single-char and printable updates
      // the buffer and jumps focus to the next matching item.
      if (event.key.length === 1 && event.key.match(/[\w]/)) {
        const nextBuffer = (typeaheadBufferRef.current + event.key).toLowerCase();
        typeaheadBufferRef.current = nextBuffer;
        scheduleTypeaheadReset();

        const matchIndex = items.findIndex(
          (item) =>
            !isItemDisabled(item, getItemDisabled) &&
            getItemDisplay(item).toLowerCase().startsWith(nextBuffer),
        );
        if (matchIndex >= 0) {
          event.preventDefault();
          setFocusedIndex(matchIndex);
        }
      }
    },
    [isOpen, items, focusedIndex, getItemDisabled, onActivate, onClose, getItemDisplay, scheduleTypeaheadReset],
  );

  const getItemTabIndex = useCallback(
    (index: number): number => (index === focusedIndex ? 0 : -1),
    [focusedIndex],
  );

  // Expose a stable API object so consumers can destructure without thrashing
  // identity across renders that don't change focusedIndex.
  return useMemo(
    () => ({ focusedIndex, handleKeyDown, getItemTabIndex, setFocusedIndex }),
    [focusedIndex, handleKeyDown, getItemTabIndex],
  );
}
