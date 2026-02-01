/**
 * @file DropdownFooter.tsx
 * @brief Footer slot component for dropdown
 */

"use client";

import type { DropdownFooterProps } from "./types";

/**
 * @brief Footer component for dropdown content
 *
 * This component provides a fixed footer section that appears below
 * the dropdown list items. Useful for adding user info, action buttons,
 * or other content that should remain fixed at the bottom.
 *
 * @param props Footer configuration
 * @returns JSX element for the footer section
 */
export function DropdownFooter({
  children,
  className = "",
  separator = true,
  "data-testid": testId = "dropdown-footer",
}: DropdownFooterProps) {
  return (
    <div className={`flex-shrink-0 ${separator ? "border-t border-gray-200" : ""} ${className}`} data-testid={testId}>
      {children}
    </div>
  );
}
