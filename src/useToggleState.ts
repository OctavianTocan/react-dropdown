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

import { useCallback, useState } from "react";

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
 * @param options Initial state + onOpenChange observer.
 * @returns isOpen + imperative open/close/toggle/setIsOpen, all stable
 *   references that don't recreate on render.
 */
export function useToggleState(options: UseToggleStateOptions = {}): UseToggleStateReturn {
	const { defaultOpen = false, onOpenChange } = options;

	const [isOpen, setIsOpenInternal] = useState<boolean>(defaultOpen);

	const setIsOpen = useCallback(
		(next: boolean): void => {
			// Functional form so onOpenChange-only-on-transition holds even when
			// the consumer fires multiple setIsOpen(false) calls in a row.
			setIsOpenInternal((prev) => {
				if (prev === next) return prev;
				onOpenChange?.(next);
				return next;
			});
		},
		[onOpenChange],
	);

	const open = useCallback((): void => {
		setIsOpen(true);
	}, [setIsOpen]);

	const close = useCallback((): void => {
		setIsOpen(false);
	}, [setIsOpen]);

	const toggle = useCallback((): void => {
		setIsOpenInternal((prev) => {
			onOpenChange?.(!prev);
			return !prev;
		});
	}, [onOpenChange]);

	return { isOpen, setIsOpen, open, close, toggle };
}
