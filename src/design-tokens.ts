/**
 * @file design-tokens.ts
 * @brief Local design tokens for dropdown component
 *
 * Self-contained design tokens to avoid external dependencies.
 * These values match the standard elevated shadow and animation duration patterns.
 */

/**
 * Soft elevated shadow for floating elements (dropdowns, menus).
 * Creates a subtle depth effect with 6 layered shadows at 3% opacity.
 */
export const ELEVATED_SHADOW =
  '0px 0px 0px 1px rgba(0,0,0,0.03), 0px 1px 1px 0px rgba(0,0,0,0.03), 0px 2px 2px 0px rgba(0,0,0,0.03), 0px 4px 4px 0px rgba(0,0,0,0.03), 0px 8px 8px 0px rgba(0,0,0,0.03), 0px 16px 16px 0px rgba(0,0,0,0.03)';

/**
 * Exit animation duration in milliseconds.
 * Used for fade-out animations when dropdown closes.
 */
export const EXIT_ANIMATION_DURATION_MS = 150;
