import type { ReactElement } from "react";

/**
 * Trailing chevron for {@link DropdownSubmenuTrigger} — matches the common
 * “this row opens a submenu” affordance (e.g. macOS context menus, Radix
 * `DropdownMenuSubTrigger`).
 */
export function SubmenuChevronIcon({ className }: { className?: string }): ReactElement {
	return (
		<svg
			aria-hidden
			className={className}
			fill="none"
			height="14"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			viewBox="0 0 24 24"
			width="14"
		>
			<path d="m9 18 6-6-6-6" />
		</svg>
	);
}
