/**
 * @file DropdownContextMenu.tsx
 * @brief Right-click context-menu primitive built on top of {@link DropdownRoot}.
 *
 * Family of three components:
 * - {@link DropdownContextMenu} — provider; stores cursor coordinates from the
 *   right-click and exposes them to a virtual anchor element so the existing
 *   {@link DropdownContent} positioning + collision-flip logic positions the
 *   panel at the cursor.
 * - {@link DropdownContextMenuTrigger} — captures `oncontextmenu` on its child,
 *   prevents the browser's native menu, and opens the panel at the click point.
 * - {@link DropdownContextMenuContent} — portaled panel that hosts the JSX
 *   children (use {@link DropdownMenuItem} / {@link DropdownMenuLabel} / etc.).
 *   Reuses the same motion timing the root dropdown uses, so visual continuity
 *   is automatic.
 *
 * Why a separate component instead of a `mode='context'` flag on
 * {@link DropdownPanelMenu}: trigger semantics differ entirely (right-click on
 * arbitrary element vs. left-click on a button), and the positioning anchor is
 * a virtual point rather than the trigger's bounding rect. Sharing infrastructure
 * with {@link DropdownRoot} means submenus, items, motion, and click-outside all
 * work identically — only the trigger event surface and the anchor are new.
 *
 * The panel-mode {@link DropdownMenuItem} works inside {@link DropdownContextMenuContent}
 * unchanged because both roots provide the same {@link DropdownContextValue} shape;
 * this lets `frontend/components/ui/menu-context.tsx` route the same item tree
 * into either kind of menu.
 */

"use client";

import {
	createContext,
	useCallback,
	useContext,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { DropdownRoot } from "./DropdownRoot";
import { DropdownContent } from "./DropdownContent";
import { useDropdownContext } from "./DropdownContext";
import { Slot } from "./Slot";

/**
 * @brief Internal context shape — exposes cursor coordinates and an open
 * trigger to the trigger child.
 */
interface ContextMenuContextValue {
	/** Open the menu at the given viewport coordinates. */
	openAt: (clientX: number, clientY: number) => void;
	/** Imperatively close the menu. */
	close: () => void;
	/**
	 * Ref to the virtual anchor element. The anchor is a 1×1 fixed-position div
	 * placed at the cursor coordinates so {@link DropdownContent}'s existing
	 * positioning math (which reads a bounding rect from `anchorRef`) lands the
	 * panel at the click point.
	 */
	anchorRef: React.RefObject<HTMLElement | null>;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

function useContextMenuContext(): ContextMenuContextValue {
	const ctx = useContext(ContextMenuContext);
	if (!ctx) {
		throw new Error(
			"DropdownContextMenuTrigger / DropdownContextMenuContent must be rendered inside <DropdownContextMenu>.",
		);
	}
	return ctx;
}

/**
 * @brief Props for {@link DropdownContextMenu}.
 */
export interface DropdownContextMenuProps {
	/** Trigger + content children. */
	children: ReactNode;
	/** Fires whenever the open state changes. */
	onOpenChange?: (isOpen: boolean) => void;
	/**
	 * Distance (px) from the cursor to the panel edge. Default: 0 (panel
	 * top-left sits exactly at the cursor).
	 */
	offset?: number;
	/** Optional test id for the root wrapper. */
	"data-testid"?: string;
}

/**
 * @brief Provider for the context-menu family.
 *
 * Owns the open state and cursor coordinates. The trigger child writes
 * coordinates here on right-click, the content child reads them via the
 * shared anchor ref to position itself.
 *
 * Internally wraps a {@link DropdownRoot} so the entire ecosystem
 * (DropdownContent, DropdownSubmenu, DropdownMenuItem, click-outside,
 * motion, reduced-motion) works without modification.
 */
export function DropdownContextMenu({
	children,
	onOpenChange,
	offset = 0,
	"data-testid": testId = "dropdown-context-menu",
}: DropdownContextMenuProps): React.JSX.Element {
	const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
	// The anchor element is rendered as a fixed-position 1×1 div at the cursor
	// coordinates — DropdownContent's `anchorRef` positioning treats it as the
	// trigger's bounding rect, so the panel lands at the cursor with full
	// collision-flip support for free.
	const anchorRef = useRef<HTMLDivElement | null>(null);

	const openAt = useCallback((clientX: number, clientY: number): void => {
		setPosition({ x: clientX, y: clientY });
	}, []);

	const close = useCallback((): void => {
		setPosition(null);
	}, []);

	const value = useMemo<ContextMenuContextValue>(
		() => ({
			openAt,
			close,
			anchorRef: anchorRef as React.RefObject<HTMLElement | null>,
		}),
		[openAt, close],
	);

	return (
		<ContextMenuContext.Provider value={value}>
			<ContextMenuOpener
				position={position}
				anchorRef={anchorRef}
				close={close}
				onOpenChange={onOpenChange}
				offset={offset}
				testId={testId}
			>
				{children}
			</ContextMenuOpener>
		</ContextMenuContext.Provider>
	);
}

/**
 * @brief Bridges the cursor-coords state into a {@link DropdownRoot}.
 *
 * Renders the virtual anchor at the cursor position (so the existing
 * positioning math works), then delegates everything else to `DropdownRoot`.
 * Uses `selectedItem`/`items=[]` because the data path is unused — items are
 * rendered as JSX children of {@link DropdownContextMenuContent}.
 *
 * The anchor is rendered with `pointer-events-none` so it can't capture
 * clicks meant for the panel. It's `aria-hidden` since it's an internal
 * positioning helper, not part of the accessibility tree.
 */
function ContextMenuOpener({
	children,
	position,
	anchorRef,
	close,
	onOpenChange,
	offset,
	testId,
}: {
	children: ReactNode;
	position: { x: number; y: number } | null;
	anchorRef: React.MutableRefObject<HTMLDivElement | null>;
	close: () => void;
	onOpenChange?: (isOpen: boolean) => void;
	offset: number;
	testId: string;
}): React.JSX.Element {
	const isOpen = position !== null;

	const handleOpenChange = useCallback(
		(open: boolean): void => {
			onOpenChange?.(open);
			if (!open) close();
		},
		[onOpenChange, close],
	);

	return (
		<>
			{/*
			 * Virtual anchor: a 1×1 fixed-position div at the cursor coordinates.
			 * Aria-hidden + pointer-events-none so it never participates in
			 * accessibility or interaction. When `position` is null the element
			 * still mounts (so the ref stays attached for the next open) but is
			 * positioned off-screen at -9999.
			 */}
			<div
				ref={anchorRef}
				aria-hidden="true"
				style={{
					position: "fixed",
					top: position?.y ?? -9999,
					left: position?.x ?? -9999,
					width: 1,
					height: 1,
					pointerEvents: "none",
				}}
			/>
			{/*
			 * NB: we don't `key` the DropdownRoot on position. Keying on coords
			 * would force a remount on every open — but the remount destroys the
			 * portaled panel synchronously, which races with React's click event
			 * dispatch. Concretely: clicking a menuitem fires `mousedown`, which
			 * triggers `useClickOutside` to call `closeDropdown` (because the
			 * portaled item is outside the DropdownRoot's container in the DOM),
			 * which clears `position`, which would unmount the panel via the key
			 * change BEFORE React fires the synthetic `click` on the button.
			 * The `click` then dispatches to a removed element and the item's
			 * `onSelect` is never invoked.
			 *
			 * Instead, the panel relies on AnimatePresence inside DropdownContent
			 * to keep the DOM alive during exit motion, so `mousedown → click`
			 * sequencing on the original button stays intact. The position
			 * `<div>` above already updates fluidly via state, so reopening at
			 * a new cursor point still reflows correctly without a remount.
			 */}
			<DropdownRootShim
				isOpen={isOpen}
				onOpenChange={handleOpenChange}
				anchorRef={anchorRef as React.RefObject<HTMLElement | null>}
				offset={offset}
				testId={testId}
			>
				{children}
			</DropdownRootShim>
		</>
	);
}

/**
 * Empty items array reused across mounts. The data path is unused for the
 * context menu — JSX children carry the items.
 */
const EMPTY_ITEMS: readonly never[] = [];
const noop = (): void => {};
const noopKey = (_: never): string => "";
const noopDisplay = (_: never): string => "";

/**
 * @brief Internal shim that drives the {@link DropdownRoot} from external open
 * state.
 *
 * `DropdownRoot` owns its own `isOpen` state; this shim opens it on mount when
 * `isOpen=true` (the parent only mounts the shim with `isOpen=true` when the
 * cursor has been set, so this fires exactly once per open). When the user
 * dismisses (click-outside, escape, item activation) `DropdownRoot` calls
 * `onOpenChange(false)`, which we forward to the parent so it can clear
 * `position` and unmount the shim.
 */
function DropdownRootShim({
	children,
	isOpen,
	onOpenChange,
	anchorRef,
	offset,
	testId,
}: {
	children: ReactNode;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	anchorRef: React.RefObject<HTMLElement | null>;
	offset: number;
	testId: string;
}): React.JSX.Element {
	return (
		<DropdownRoot<never>
			items={EMPTY_ITEMS}
			selectedItem={null}
			onSelect={noop}
			getItemKey={noopKey}
			getItemDisplay={noopDisplay}
			anchorRef={anchorRef}
			usePortal
			placement="bottom"
			align="start"
			offset={offset}
			onOpenChange={onOpenChange}
			data-testid={testId}
		>
			<OpenSync isOpen={isOpen} onOpenChange={onOpenChange} />
			{children}
		</DropdownRoot>
	);
}

/**
 * @brief Pulls open state in via {@link useDropdownContext}'s `setIsOpen` and
 * fires `onOpenChange(true)` so observers see opens the same way they see
 * trigger-driven dropdowns.
 *
 * Runs once when the shim mounts with `isOpen=true` to flip the dropdown's
 * own state without going through `toggleDropdown` (which would require a
 * synthetic click event). Close events propagate naturally via
 * `DropdownRoot.closeDropdown`, which already calls `onOpenChange(false)`.
 */
function OpenSync({
	isOpen,
	onOpenChange,
}: {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}): null {
	const { setIsOpen } = useDropdownContext();
	useLayoutEffect(() => {
		if (isOpen) {
			setIsOpen(true);
			// `setIsOpen` doesn't run the dropdown's `openDropdown` path that
			// fires `onOpenChange`, so we publish the open here so observers
			// see opens identically to trigger-driven dropdowns.
			onOpenChange(true);
		}
	}, [isOpen, setIsOpen, onOpenChange]);
	return null;
}

/**
 * @brief Props for {@link DropdownContextMenuTrigger}.
 */
export interface DropdownContextMenuTriggerProps {
	/**
	 * When `true`, props are merged onto the consumer's child element via
	 * {@link Slot}. Otherwise the trigger renders as a `<div>` wrapper.
	 */
	asChild?: boolean;
	/** Trigger content. */
	children: ReactNode;
	/** Optional className when not using `asChild`. */
	className?: string;
	/** Disables the right-click handler entirely. */
	disabled?: boolean;
}

/**
 * @brief Element that opens the context menu on right-click.
 *
 * Captures `oncontextmenu`, calls `event.preventDefault()` so the browser's
 * native menu doesn't appear, then opens the panel at `event.clientX`/`clientY`
 * via the shared context.
 *
 * @example asChild for a row that already wraps something focusable
 * ```tsx
 * <DropdownContextMenuTrigger asChild>
 *   <div role="button" tabIndex={0}>Right-click me</div>
 * </DropdownContextMenuTrigger>
 * ```
 */
export function DropdownContextMenuTrigger({
	asChild = false,
	children,
	className,
	disabled = false,
}: DropdownContextMenuTriggerProps): React.JSX.Element {
	const { openAt } = useContextMenuContext();

	const handleContextMenu = useCallback(
		(event: React.MouseEvent): void => {
			if (disabled) return;
			event.preventDefault();
			// Capture from the page's coordinate system — DropdownContent positions
			// the panel using `position: fixed` against the viewport, so clientX/Y
			// map 1:1 onto the panel's top-left.
			openAt(event.clientX, event.clientY);
		},
		[openAt, disabled],
	);

	if (asChild) {
		return (
			<Slot onContextMenu={handleContextMenu}>{children}</Slot>
		);
	}
	return (
		<div onContextMenu={handleContextMenu} className={className}>
			{children}
		</div>
	);
}

/**
 * @brief Props for {@link DropdownContextMenuContent}.
 */
export interface DropdownContextMenuContentProps {
	/** Panel children — typically {@link DropdownMenuItem}, separators, labels. */
	children: ReactNode;
	/** Optional className applied to the panel surface. */
	className?: string;
}

/**
 * @brief Portaled panel that hosts the right-click menu items.
 *
 * Position is driven by {@link DropdownContent}'s `anchorRef` math. Reuses
 * the same motion variants as the regular dropdown for visual continuity.
 *
 * Renders nothing while the menu is closed.
 */
export function DropdownContextMenuContent({
	children,
	className = "popover-styled p-1 min-w-44",
}: DropdownContextMenuContentProps): React.JSX.Element {
	return (
		<DropdownContent portal className={className}>
			{children}
		</DropdownContent>
	);
}
