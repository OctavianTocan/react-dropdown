/**
 * @file DropdownPanelMenu.tsx
 * @brief JSX-children dropdown menu — composes arbitrary item trees as children.
 *
 * Sibling to {@link DropdownMenu} (data-driven) for consumers that need a
 * Radix-`DropdownMenu`-style API: render `<DropdownMenuItem>` / `<DropdownMenuLabel>`
 * / `<DropdownMenuSeparator>` directly as children of the panel, instead of
 * passing `items + renderItem`.
 *
 * Why a sibling component instead of overloading `DropdownMenu`:
 * - Keeps the existing 152-test surface byte-for-byte unchanged.
 * - Makes the API surface honest — there's no "if items is empty, render
 *   children instead" branching that consumers have to understand.
 * - Internal: just wraps `DropdownRoot` with a no-op item array + no-op
 *   onSelect, then renders `<DropdownContent>{children}</DropdownContent>`.
 *   Items use {@link useDropdownContext} to read `closeDropdown` so
 *   close-on-select works without the data path.
 *
 * Both modes share the same {@link DropdownRoot} context, which means the
 * polymorphic `MenuComponentsContext` in `frontend/components/ui/menu-context.tsx`
 * can render the same item tree inside either a {@link DropdownPanelMenu} or
 * a {@link DropdownContextMenu} — the panel items only depend on the context's
 * `closeDropdown` and don't care which kind of root is upstream.
 */

"use client";

import { useRef, type ReactNode } from "react";
import { DropdownRoot } from "./DropdownRoot";
import { DropdownContent } from "./DropdownContent";
import { useDropdownContext } from "./DropdownContext";
import { Slot } from "./Slot";
import type { DropdownAlign, DropdownPlacement } from "./types";

/**
 * @brief Props for {@link DropdownPanelMenu}.
 */
export interface DropdownPanelMenuProps {
	/** Trigger element. With `asChild`, the trigger is rendered directly. */
	trigger: ReactNode;
	/**
	 * Panel contents. Compose with {@link DropdownMenuItem},
	 * {@link DropdownMenuSeparator}, {@link DropdownMenuLabel}, etc.
	 */
	children: ReactNode;
	/**
	 * When `true`, the trigger renders via {@link Slot} so the consumer's
	 * element receives the click + ARIA props directly. Otherwise the trigger
	 * is wrapped in a `<div>`.
	 */
	asChild?: boolean;
	/** Optional className applied to the (default) `<div>` wrapper. */
	className?: string;
	/** Optional className for the panel content. */
	contentClassName?: string;
	/**
	 * Placement of the panel relative to the trigger. Default: `'bottom'`.
	 */
	placement?: DropdownPlacement;
	/**
	 * Horizontal alignment of the panel against the trigger. Default: `'end'`.
	 */
	align?: DropdownAlign;
	/** Pixel offset added to the alignment axis. */
	alignOffset?: number;
	/** Distance in px between the trigger and the panel. */
	offset?: number;
	/** Whether to portal the panel out of its DOM parent. Default: `false`. */
	usePortal?: boolean;
	/** Disables the trigger entirely. */
	disabled?: boolean;
	/** Fires whenever the open state changes — true on open, false on close. */
	onOpenChange?: (isOpen: boolean) => void;
	/** Optional test id for the root wrapper. */
	"data-testid"?: string;
}

/**
 * @brief Internal trigger that wires the dropdown's toggle / aria props.
 *
 * Mirrors the behavior of `DropdownMenu`'s `MenuTrigger`: with `asChild`, the
 * consumer's element receives the click handler directly via {@link Slot};
 * otherwise the trigger is wrapped in a `<div role="button">`.
 */
function PanelMenuTrigger({
	children,
	asChild = false,
	triggerRef,
}: {
	children: ReactNode;
	asChild?: boolean;
	triggerRef: React.MutableRefObject<HTMLDivElement | null>;
}): React.JSX.Element {
	const { isOpen, toggleDropdown } = useDropdownContext();
	const sharedProps = {
		onClick: toggleDropdown,
		"aria-expanded": isOpen,
		"aria-haspopup": "menu" as const,
		"data-state": isOpen ? ("open" as const) : ("closed" as const),
	};

	if (asChild) {
		return (
			<Slot
				ref={triggerRef as unknown as React.Ref<HTMLElement>}
				{...sharedProps}
			>
				{children}
			</Slot>
		);
	}
	return (
		<div ref={triggerRef} {...sharedProps}>
			{children}
		</div>
	);
}

// Empty items array shared across all `DropdownPanelMenu` mounts. The reference
// stays stable so `useMemo` deps inside `DropdownRoot` don't churn when the
// consumer re-renders; the array itself is unused — JSX children carry the menu
// content, not the data path.
const EMPTY_ITEMS: readonly never[] = [];

const noop = (): void => {
	// no-op: panel-mode items dispatch via the JSX `onSelect`, not the
	// dropdown's data path. The `onSelect` prop on `DropdownRoot` is required
	// by the type, but never invoked here.
};

const noopGetItemKey = (_item: never): string => "";
const noopGetItemDisplay = (_item: never): string => "";

/**
 * @brief JSX-children dropdown menu — Radix-`DropdownMenu` parity surface.
 *
 * Renders an arbitrary tree of {@link DropdownMenuItem} / {@link DropdownMenuLabel}
 * / {@link DropdownMenuSeparator} / etc. as panel children. Hover, click, and
 * keyboard activation each fire the item's `onSelect` callback; the parent
 * panel closes after activation unless `onSelect` calls `event.preventDefault()`.
 *
 * @example
 * ```tsx
 * <DropdownPanelMenu trigger={<Button>Open</Button>} asChild>
 *   <DropdownMenuLabel>Account</DropdownMenuLabel>
 *   <DropdownMenuItem onSelect={() => navigate('/profile')}>
 *     <UserIcon /> Profile
 *   </DropdownMenuItem>
 *   <DropdownMenuItem onSelect={() => navigate('/settings')}>
 *     <SettingsIcon /> Settings
 *     <DropdownMenuShortcut>Cmd+,</DropdownMenuShortcut>
 *   </DropdownMenuItem>
 *   <DropdownMenuSeparator />
 *   <DropdownMenuItem variant="destructive" onSelect={() => signOut()}>
 *     <LogOutIcon /> Sign out
 *   </DropdownMenuItem>
 * </DropdownPanelMenu>
 * ```
 */
export function DropdownPanelMenu({
	trigger,
	children,
	asChild = false,
	className,
	contentClassName,
	placement = "bottom",
	align = "end",
	alignOffset = 0,
	offset,
	usePortal = false,
	disabled = false,
	onOpenChange,
	"data-testid": testId = "dropdown-panel-menu",
}: DropdownPanelMenuProps): React.JSX.Element {
	const triggerRef = useRef<HTMLDivElement | null>(null);
	return (
		<DropdownRoot<never>
			items={EMPTY_ITEMS}
			selectedItem={null}
			onSelect={noop}
			getItemKey={noopGetItemKey}
			getItemDisplay={noopGetItemDisplay}
			disabled={disabled}
			placement={placement}
			align={align}
			alignOffset={alignOffset}
			offset={offset}
			usePortal={usePortal}
			onOpenChange={onOpenChange}
			triggerRef={triggerRef as React.RefObject<HTMLElement | null>}
			className={className}
			data-testid={testId}
		>
			<PanelMenuTrigger asChild={asChild} triggerRef={triggerRef}>
				{trigger}
			</PanelMenuTrigger>
			<DropdownContent className={contentClassName}>{children}</DropdownContent>
		</DropdownRoot>
	);
}
