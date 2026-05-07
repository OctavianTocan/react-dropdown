/**
 * @file useToggleState.test.tsx
 * @brief Behavior tests for the shared open/close primitive that backs both
 *        `DropdownRoot` and `useDropdown`.
 *
 * The contract this hook upholds — fire `onOpenChange` only on a real
 * transition — is load-bearing across every dropdown surface in the package.
 * If this hook drifts, both component-driven and headless dropdowns
 * regress simultaneously.
 */

import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToggleState } from "../useToggleState";

describe("useToggleState", () => {
	it("starts closed by default", () => {
		const { result } = renderHook(() => useToggleState());
		expect(result.current.isOpen).toBe(false);
	});

	it("respects defaultOpen=true", () => {
		const { result } = renderHook(() => useToggleState({ defaultOpen: true }));
		expect(result.current.isOpen).toBe(true);
	});

	it("flips state via open / close / toggle", () => {
		const { result } = renderHook(() => useToggleState());
		act(() => result.current.open());
		expect(result.current.isOpen).toBe(true);
		act(() => result.current.close());
		expect(result.current.isOpen).toBe(false);
		act(() => result.current.toggle());
		expect(result.current.isOpen).toBe(true);
		act(() => result.current.toggle());
		expect(result.current.isOpen).toBe(false);
	});

	it("fires onOpenChange exactly once per transition", () => {
		const onOpenChange = vi.fn();
		const { result } = renderHook(() => useToggleState({ onOpenChange }));

		act(() => result.current.open());
		expect(onOpenChange).toHaveBeenCalledTimes(1);
		expect(onOpenChange).toHaveBeenLastCalledWith(true);

		act(() => result.current.close());
		expect(onOpenChange).toHaveBeenCalledTimes(2);
		expect(onOpenChange).toHaveBeenLastCalledWith(false);

		act(() => result.current.toggle());
		expect(onOpenChange).toHaveBeenCalledTimes(3);
		expect(onOpenChange).toHaveBeenLastCalledWith(true);
	});

	it("does NOT fire onOpenChange when the next state matches the current state", () => {
		const onOpenChange = vi.fn();
		const { result } = renderHook(() => useToggleState({ onOpenChange }));

		// open() while already closed: transition fires
		act(() => result.current.open());
		expect(onOpenChange).toHaveBeenCalledTimes(1);

		// open() while already open: no transition, no callback
		act(() => result.current.open());
		expect(onOpenChange).toHaveBeenCalledTimes(1);

		// close() while already closed: no transition, no callback
		act(() => result.current.close());
		expect(onOpenChange).toHaveBeenCalledTimes(2);
		act(() => result.current.close());
		expect(onOpenChange).toHaveBeenCalledTimes(2);
	});

	it("setIsOpen also fires onOpenChange only on transition", () => {
		const onOpenChange = vi.fn();
		const { result } = renderHook(() => useToggleState({ onOpenChange }));

		act(() => result.current.setIsOpen(true));
		expect(onOpenChange).toHaveBeenCalledTimes(1);
		expect(onOpenChange).toHaveBeenLastCalledWith(true);

		// Setting to the same value is a no-op.
		act(() => result.current.setIsOpen(true));
		expect(onOpenChange).toHaveBeenCalledTimes(1);

		act(() => result.current.setIsOpen(false));
		expect(onOpenChange).toHaveBeenCalledTimes(2);
	});

	it("returns stable callback refs across renders", () => {
		const { result, rerender } = renderHook(() => useToggleState());
		const firstOpen = result.current.open;
		const firstClose = result.current.close;
		const firstToggle = result.current.toggle;
		const firstSetIsOpen = result.current.setIsOpen;

		rerender();

		expect(result.current.open).toBe(firstOpen);
		expect(result.current.close).toBe(firstClose);
		expect(result.current.toggle).toBe(firstToggle);
		expect(result.current.setIsOpen).toBe(firstSetIsOpen);
	});
});
