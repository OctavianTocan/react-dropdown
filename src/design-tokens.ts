/**
 * @file design-tokens.ts
 * @brief Local design tokens for dropdown component
 *
 * Self-contained design tokens to avoid external dependencies.
 * These values match the standard elevated shadow and animation duration patterns.
 */

/**
 * Hard-coded fallback shadow used when the consumer hasn't supplied a CSS
 * variable override. Six layered shadows at 3% opacity for a subtle depth.
 */
const FALLBACK_ELEVATED_SHADOW =
  '0px 0px 0px 1px rgba(0,0,0,0.03), 0px 1px 1px 0px rgba(0,0,0,0.03), 0px 2px 2px 0px rgba(0,0,0,0.03), 0px 4px 4px 0px rgba(0,0,0,0.03), 0px 8px 8px 0px rgba(0,0,0,0.03), 0px 16px 16px 0px rgba(0,0,0,0.03)';

/**
 * Soft elevated shadow for floating elements (dropdowns, menus). Resolves
 * via the `--dropdown-shadow` CSS custom property when set, falling back to
 * a layered 3%-opacity stack. Override per app via:
 *
 * ```css
 * :root { --dropdown-shadow: 0 24px 48px -12px rgb(0 0 0 / 0.18); }
 * ```
 *
 * Setting the variable on a scoped ancestor (rather than `:root`) lets you
 * theme dropdowns differently per region (e.g. a darker shadow inside a
 * light card surface).
 */
export const ELEVATED_SHADOW = `var(--dropdown-shadow, ${FALLBACK_ELEVATED_SHADOW})`;

/**
 * Exit animation duration in milliseconds.
 * Used for fade-out animations when dropdown closes.
 */
export const EXIT_ANIMATION_DURATION_MS = 150;
