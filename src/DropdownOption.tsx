/**
 * @file DropdownOption.tsx
 * @brief Default row option for dropdown lists
 */

"use client";

import { useState } from "react";
import type { ReactNode } from "react";

/**
 * @brief Default dropdown option component
 * @description Renders a clickable dropdown option with icon, label, and optional description.
 * Handles selection state, disabled state, and hover effects. Provides proper ARIA attributes
 * for accessibility.
 * @template T The type of the item
 * @param props Option configuration
 * @param props.item The item data
 * @param props.onSelect Callback function when the option is clicked
 * @param props.isSelected Whether this option is currently selected
 * @param props.displayText The text to display as the label
 * @param props.dataKey Unique key for the option element
 * @param props.description Optional description text shown below the label
 * @param props.icon Optional icon element to display before the label
 * @param props.isDisabled Whether this option is disabled
 * @param props.className Additional CSS classes for the option
 * @returns JSX element for the option
 */
export function DropdownOption<T>({
  item,
  onSelect,
  isSelected,
  displayText,
  dataKey,
  description,
  icon,
  isDisabled = false,
  className = "",
}: {
  item: T;
  onSelect: (item: T) => void;
  isSelected: boolean;
  displayText: string;
  dataKey: string;
  description: string | null;
  icon?: ReactNode;
  isDisabled?: boolean;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  /**
   * @brief Handles click events on the option
   * @description Calls the onSelect callback if the option is not disabled.
   * Prevents selection of disabled items.
   */
  const selectOption = () => {
    if (!isDisabled) {
      onSelect(item);
    }
  };
  const selectOptionWithKeyboard = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    selectOption();
  };

  const baseClasses = "px-3 py-1.5 text-sm transition-colors";
  const selectedClasses = isSelected ? "bg-sky-50 text-sky-600 font-medium" : "";
  const hasCustomHover = className.includes("hover:");
  const disabledClasses = isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
  // Remove hover classes from className since we'll handle hover via inline styles
  const classNameWithoutHover = className.replace(/hover:[^\s]+/g, "").trim();
  const combinedClasses = `${baseClasses} ${selectedClasses} ${disabledClasses} ${classNameWithoutHover}`.trim();

  // Extract hover background color from className if present
  const hoverBgMatch = className.match(/hover:!?bg-\[([^\]]+)\]/);
  const hoverBgColor = hoverBgMatch ? hoverBgMatch[1] : hasCustomHover ? "#fee2e2" : "#f3f4f6"; // red-100 or gray-100

  return (
    <div
      data-key={dataKey}
      onClick={selectOption}
      onKeyDown={selectOptionWithKeyboard}
      className={combinedClasses}
      style={isHovered && !isDisabled ? { backgroundColor: hoverBgColor } : undefined}
      role="option"
      aria-selected={isSelected}
      aria-disabled={isDisabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2">
        <div className="flex flex-col flex-1">
          <span>{displayText}</span>
          {description && <span className="text-xs font-normal text-zinc-500">{description}</span>}
        </div>
        {icon && (
          <span className="text-base" aria-hidden>
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}
