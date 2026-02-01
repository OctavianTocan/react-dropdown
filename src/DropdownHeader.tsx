/**
 * @file DropdownHeader.tsx
 * @brief Header slot component for dropdown
 */

"use client";

import type { DropdownHeaderProps } from "./types";

/**
 * @brief Header component for dropdown content
 *
 * This component provides a fixed header section that appears above
 * the dropdown list items. Useful for adding titles, search inputs,
 * or other content that should remain fixed at the top.
 *
 * @param props Header configuration
 * @returns JSX element for the header section
 */
export function DropdownHeader({
  children,
  className = "",
  separator = false,
  "data-testid": testId = "dropdown-header",
}: DropdownHeaderProps) {
  return (
    <div className={`flex-shrink-0 ${separator ? "border-b border-gray-200" : ""} ${className}`} data-testid={testId}>
      {children}
    </div>
  );
}
