/**
 * Tailwind utilities for disabled dropdown rows (`DropdownMenuItem`,
 * `DropdownSubmenuTrigger`). Uses `disabled:*` variants — only apply when the host
 * element has the `disabled` attribute (no visual change on enabled controls).
 *
 * @packageDocumentation
 */

/** Shared muted-tray disabled styling for panel menu rows and submenu triggers. */
export const MENU_ROW_DISABLED_VISUAL_CLASSNAME =
	"disabled:pointer-events-none disabled:bg-muted/50 disabled:text-muted-foreground disabled:hover:bg-muted/50 disabled:focus:bg-muted/50 disabled:focus-visible:bg-muted/50 disabled:active:bg-muted/50 disabled:[&>svg:not([class*='text-'])]:text-muted-foreground/55";
