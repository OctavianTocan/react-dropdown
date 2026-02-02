/**
 * @file hooks.ts
 * @brief Standalone hooks export for @octavian-tocan/react-dropdown
 *
 * This file provides a separate entry point for importing hooks only,
 * enabling better tree-shaking when you only need the hooks.
 *
 * @example
 * ```tsx
 * import { useDropdownContext, useClickOutside } from '@octavian-tocan/react-dropdown/hooks';
 * ```
 */

export { useDropdownContext, useKeyboardNavigation, useClickOutside } from "./DropdownContext";
