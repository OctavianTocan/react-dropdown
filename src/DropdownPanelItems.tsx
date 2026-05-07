/**
 * @file DropdownPanelItems.tsx
 * @brief JSX-children item primitives for use inside `DropdownPanelMenu` /
 *        `DropdownContextMenuContent`.
 *
 * These give consumers a Radix-`DropdownMenu`-equivalent surface for composing
 * arbitrary item trees (icons + labels + shortcuts, separators, labels, etc.)
 * directly as JSX, instead of going through the data-driven `items + renderItem`
 * API on {@link DropdownMenu}.
 *
 * Components:
 * - {@link DropdownMenuItem} — clickable row. `onSelect(event)` fires on click /
 *   Enter / Space; calling `event.preventDefault()` opts out of the default
 *   "close the parent dropdown after selection" behavior. `asChild` lets the
 *   consumer wrap the item around an `<a href>` or other custom element.
 * - {@link DropdownMenuSeparator} — visual divider between groups of items.
 * - {@link DropdownMenuLabel} — non-interactive section header.
 * - {@link DropdownMenuShortcut} — right-aligned keyboard hint label.
 *
 * The items are intentionally small and styling-light so callers can pass
 * `className` to match their design system. The defaults aim for parity with
 * the in-repo `popover-styled` aesthetic (rounded-[4px] item, hover surface
 * `bg-foreground/[0.03]`, etc.) but every visual detail is overridable.
 */

"use client";

import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { Slot } from "./Slot";
import { useDropdownContext } from "./DropdownContext";

/**
 * @brief Event-like object passed to {@link DropdownMenuItemProps.onSelect}.
 *
 * Mirrors the shape Radix's `DropdownMenu.Item.onSelect` callback expects so
 * existing consumers can migrate without changing their handler bodies. Calling
 * `preventDefault()` opts the item out of the default close-on-select behavior.
 */
export interface DropdownMenuItemSelectEvent {
	/** When true, the parent dropdown does NOT close after selection. */
	defaultPrevented: boolean;
	/** Mark the event as handled — suppresses the default close-on-select. */
	preventDefault: () => void;
}

/**
 * @brief Props for {@link DropdownMenuItem}.
 *
 * Extends the native `<button>` props so consumers can spread `aria-*`, `data-*`,
 * `id`, etc. directly onto the rendered row.
 */
export interface DropdownMenuItemProps
	extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onSelect"> {
	/**
	 * When `true`, the item delegates its rendering to its single child via
	 * {@link Slot} — useful for wrapping the row around a custom element such as
	 * an `<a href>` link or a `<RouterLink>`.
	 */
	asChild?: boolean;
	/**
	 * Adds left padding equivalent to a leading icon, so a label-only item
	 * lines up vertically with sibling items that DO have icons. Mirrors
	 * Radix's `inset` prop semantics.
	 */
	inset?: boolean;
	/**
	 * Visual variant. `'default'` uses the regular foreground color; `'destructive'`
	 * tints the row red so destructive actions read as such at a glance.
	 */
	variant?: "default" | "destructive";
	/**
	 * Called when the item is activated via click / Enter / Space. Receives a
	 * Radix-shaped `{ defaultPrevented, preventDefault }` event so existing
	 * consumers can keep their handler bodies unchanged. Calling
	 * `event.preventDefault()` opts out of the default close-on-select.
	 */
	onSelect?: (event: DropdownMenuItemSelectEvent) => void;
}

/**
 * Default item styling. Mirrors the existing `components/ui/dropdown-menu.tsx`
 * Radix wrapper so visual parity holds during migration. Consumers can override
 * any of these by passing a `className`.
 */
const DEFAULT_ITEM_CLASSNAME =
	"focus:bg-foreground/[0.03] hover:bg-foreground/[0.03] data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive [&>svg:not([class*='text-'])]:text-muted-foreground gap-2 rounded-[4px] px-2 py-1.5 pr-4 text-sm data-inset:pl-9.5 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:shrink-0 group/dropdown-menu-item relative flex w-full cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0";

/**
 * @brief Clickable item row inside a panel-mode dropdown / context menu.
 *
 * Calls `onSelect(event)` on activation. By default the parent dropdown
 * closes after selection — call `event.preventDefault()` to keep it open
 * (used by the prompt-input attachment menu, which opens a file picker on
 * select but keeps the menu in place for the user to add another action).
 *
 * @example
 * ```tsx
 * <DropdownMenuItem onSelect={() => handleEdit()}>
 *   <PencilIcon /> Edit
 *   <DropdownMenuShortcut>Cmd+E</DropdownMenuShortcut>
 * </DropdownMenuItem>
 * ```
 *
 * @example asChild for navigation
 * ```tsx
 * <DropdownMenuItem asChild>
 *   <a href="/settings">Settings</a>
 * </DropdownMenuItem>
 * ```
 */
export const DropdownMenuItem = forwardRef<HTMLElement, DropdownMenuItemProps>(
	function DropdownMenuItem(
		{
			asChild = false,
			inset = false,
			variant = "default",
			disabled = false,
			className,
			children,
			onClick,
			onKeyDown,
			onSelect,
			...rest
		},
		forwardedRef,
	) {
		const { closeDropdown } = useDropdownContext();

		const fireSelect = (): void => {
			if (disabled) return;
			let prevented = false;
			const event: DropdownMenuItemSelectEvent = {
				defaultPrevented: false,
				preventDefault: () => {
					prevented = true;
					event.defaultPrevented = true;
				},
			};
			onSelect?.(event);
			// Close the parent panel by default; consumer opts out via preventDefault.
			if (!prevented) closeDropdown();
		};

		const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
			onClick?.(event as React.MouseEvent<HTMLButtonElement>);
			if (event.defaultPrevented) return;
			fireSelect();
		};

		const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>): void => {
			onKeyDown?.(event as React.KeyboardEvent<HTMLButtonElement>);
			if (event.defaultPrevented) return;
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				fireSelect();
			}
		};

		const sharedProps = {
			role: "menuitem" as const,
			"data-slot": "dropdown-menu-item" as const,
			"data-inset": inset ? "" : undefined,
			"data-variant": variant,
			"data-disabled": disabled ? "" : undefined,
			className: className ?? DEFAULT_ITEM_CLASSNAME,
			onClick: handleClick,
			onKeyDown: handleKeyDown,
		};

		if (asChild) {
			return (
				<Slot ref={forwardedRef} {...sharedProps}>
					{children}
				</Slot>
			);
		}

		return (
			<button
				type="button"
				ref={forwardedRef as React.Ref<HTMLButtonElement>}
				disabled={disabled}
				{...sharedProps}
				{...rest}
			>
				{children}
			</button>
		);
	},
);

/**
 * @brief Props for {@link DropdownMenuSeparator}.
 */
export type DropdownMenuSeparatorProps = HTMLAttributes<HTMLDivElement>;

/**
 * @brief Visual divider between groups of menu items.
 *
 * Renders a 1-px horizontal line spanning the panel's full inner width.
 * Pure presentational element — has no role.
 */
export function DropdownMenuSeparator({
	className,
	...rest
}: DropdownMenuSeparatorProps): React.JSX.Element {
	return (
		<div
			role="separator"
			data-slot="dropdown-menu-separator"
			className={className ?? "bg-foreground/10 -mx-1 my-1 h-px"}
			{...rest}
		/>
	);
}

/**
 * @brief Props for {@link DropdownMenuLabel}.
 */
export interface DropdownMenuLabelProps extends HTMLAttributes<HTMLDivElement> {
	/**
	 * Adds the same left padding as {@link DropdownMenuItemProps.inset} so the
	 * label aligns with item labels that have leading icons.
	 */
	inset?: boolean;
}

/**
 * @brief Non-interactive section header inside a panel-mode menu.
 *
 * Use to label a group of related items. Renders as a plain `<div>` (not a
 * `role="heading"`) — screen readers should treat it as visual flair while the
 * items themselves carry the menu semantics.
 */
export function DropdownMenuLabel({
	inset = false,
	className,
	...rest
}: DropdownMenuLabelProps): React.JSX.Element {
	return (
		<div
			data-slot="dropdown-menu-label"
			data-inset={inset ? "" : undefined}
			className={
				className ?? "px-2 py-1.5 text-xs font-medium text-muted-foreground data-inset:pl-8"
			}
			{...rest}
		/>
	);
}

/**
 * @brief Right-aligned keyboard shortcut hint inside an item.
 *
 * Pure presentational. Place inside a {@link DropdownMenuItem} — the ml-auto
 * default pushes it to the right edge of the row.
 */
export function DropdownMenuShortcut({
	className,
	...rest
}: HTMLAttributes<HTMLSpanElement>): React.JSX.Element {
	return (
		<span
			data-slot="dropdown-menu-shortcut"
			className={className ?? "ml-auto text-xs tracking-widest text-muted-foreground"}
			{...rest}
		/>
	);
}
