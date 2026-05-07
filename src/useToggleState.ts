/**
 * @file useToggleState.ts
 * @brief Single open/close state primitive shared by `DropdownRoot` and
 *        `useDropdown`.
 *
 * Both consumers previously kept their own `useState(false)` plus a triplet
 * of `open` / `close` / `toggle` callbacks, each independently implementing
 * the rule "fire `onOpenChange` only on an actual state transition."
 * Centralizing the rule here means every dropdown surface — components,
 * headless hook, panel-mode, context-menu — funnels through a single source
 * of truth for open-state.
 *
 * What's intentionally NOT in this hook (per advisor's scope-control review):
 *
 * - **Click-outside detection.** The component path uses `useClickOutside`
 *   (mousedown + touchstart on a single ref), the headless path listens on
 *   `pointerdown` against trigger + content refs. The two semantics are
 *   asserted by separate tests; merging them would regress those.
 * - **Keyboard navigation.** Already shared via `useMenuKeyboard`.
 * - **Selection / search / animation state / placement.** Component-only;
 *   these don't make sense in a generic toggle primitive.
 *
 * The hook is deliberately tiny — adding more here re-introduces the
 * coupling that motivated the audit.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Configuration for {@link useToggleState}. */
export interface UseToggleStateOptions {
	/** Whether the toggle starts open. Default: `false`. */
	defaultOpen?: boolean;
	/**
	 * Callback fired when the toggle transitions between open and closed.
	 * Critical: this fires only on an actual transition — flipping
	 * `setIsOpen(true)` while already open is a no-op.
	 */
	onOpenChange?: (open: boolean) => void;
}

/** Return shape of {@link useToggleState}. */
export interface UseToggleStateReturn {
	/** Whether the toggle is currently open. */
	isOpen: boolean;
	/**
	 * Imperative setter that fires `onOpenChange` only when the next state
	 * differs from the current state. Use the boolean form (not the
	 * functional form) to set explicit values; the hook's internal
	 * functional form ensures we read the freshest state.
	 */
	setIsOpen: (next: boolean) => void;
	/** Open the toggle. No-op if already open. */
	open: () => void;
	/** Close the toggle. No-op if already closed. */
	close: () => void;
	/** Flip the toggle. */
	toggle: () => void;
}

/**
 * Tiny shared open/close primitive — see file header for design rationale.
 *
 * `onOpenChange` is dispatched from a `useEffect` that compares against a
 * previous-isOpen ref, NOT from inside the `setIsOpenInternal` updater. The
 * earlier in-updater dispatch fired during the React render phase whenever
 * StrictMode (or the dev-only purity assertion) re-invoked the updater,
 * which surfaced as the warning:
 *
 *   "Cannot update a component (`AutoReviewSelector`) while rendering a
 *   different component (`DropdownRoot`)."
 *
 * Moving the dispatch to a post-commit effect keeps the "fire only on a
 * real transition" contract (the prev-ref guard) while letting the parent
 * component's `setState` happen safely outside render.
 *
 * @param options Initial state + onOpenChange observer.
 * @returns isOpen + imperative open/close/toggle/setIsOpen, all stable
 *   references that don't recreate on render.
 */
export function useToggleState(options: UseToggleStateOptions = {}): UseToggleStateReturn {
	const { defaultOpen = false, onOpenChange } = options;

	const [isOpen, setIsOpenInternal] = useState<boolean>(defaultOpen);

	// Tracks the last `isOpen` value we already dispatched. Initialized to the
	// same `defaultOpen` we seeded `useState` with so the post-commit effect
	// does NOT fire a spurious `onOpenChange(defaultOpen)` on mount — only real
	// transitions trigger the callback.
	const prevIsOpenRef = useRef<boolean>(defaultOpen);
	// Latest `onOpenChange` callback held in a ref so the dispatch effect can
	// read it without re-running on every prop change. If the consumer passes
	// a fresh-each-render handler we'd otherwise re-fire on every parent
	// render, which violates the "transition-only" contract.
	const onOpenChangeRef = useRef(onOpenChange);
	useEffect(() => {
		onOpenChangeRef.current = onOpenChange;
	}, [onOpenChange]);

	useEffect(() => {
		if (prevIsOpenRef.current === isOpen) return;
		prevIsOpenRef.current = isOpen;
		onOpenChangeRef.current?.(isOpen);
	}, [isOpen]);

	const setIsOpen = useCallback((next: boolean): void => {
		// Functional form so the read of `prev` is always current even when
		// callers fire multiple setIsOpen(...) in a row. The post-commit effect
		// above gates `onOpenChange` to actual transitions.
		setIsOpenInternal((prev) => (prev === next ? prev : next));
	}, []);

	const open = useCallback((): void => {
		setIsOpen(true);
	}, [setIsOpen]);

	const close = useCallback((): void => {
		setIsOpen(false);
	}, [setIsOpen]);

	const toggle = useCallback((): void => {
		setIsOpenInternal((prev) => !prev);
	}, []);

	return { isOpen, setIsOpen, open, close, toggle };
}
