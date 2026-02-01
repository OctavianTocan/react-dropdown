import React2, { createContext, useContext, useRef, useState, useCallback, useMemo, useLayoutEffect, useEffect } from 'react';
import { useClickOutside as useClickOutside$1 } from '@react-hookz/web';
import { jsx, jsxs } from 'react/jsx-runtime';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';

// src/DropdownRoot.tsx
var DropdownContext = createContext(null);
function useDropdownContext() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error(
      "useDropdownContext must be used within a DropdownProvider. Wrap your component with <DropdownRoot> to provide context."
    );
  }
  return context;
}
function DropdownProvider({ children, value }) {
  return /* @__PURE__ */ jsx(DropdownContext.Provider, { value, children });
}
function useKeyboardNavigation(items, getItemKey, onSelect, closeDropdown) {
  const focusedIndexRef = useRef(-1);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const handleKeyDown = (event) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusedIndexRef.current = Math.min(focusedIndexRef.current + 1, items.length - 1);
        setFocusedIndex(focusedIndexRef.current);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusedIndexRef.current = Math.max(focusedIndexRef.current - 1, 0);
        setFocusedIndex(focusedIndexRef.current);
        break;
      case "Enter":
        event.preventDefault();
        if (focusedIndexRef.current >= 0 && focusedIndexRef.current < items.length) {
          onSelect(items[focusedIndexRef.current]);
        }
        break;
      case "Escape":
        event.preventDefault();
        closeDropdown();
        break;
    }
  };
  const resetFocus = () => {
    focusedIndexRef.current = -1;
    setFocusedIndex(-1);
  };
  return {
    handleKeyDown,
    resetFocus,
    focusedIndex
  };
}
function useClickOutside(dropdownRef, closeDropdown, isOpen) {
  useClickOutside$1(
    dropdownRef,
    (event) => {
      if (!isOpen) return;
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    },
    ["mousedown"]
  );
}
function DropdownRoot({
  children,
  items,
  selectedItem: initialSelectedItem = null,
  onSelect,
  getItemKey,
  getItemDisplay,
  filterItems,
  disabled = false,
  placeholder,
  className = "",
  dropdownPlacement = "bottom",
  getItemDescription,
  getItemIcon,
  getItemSection,
  getItemSeparator,
  getItemDisabled,
  getItemClassName,
  closeOnSelect = true,
  onOpenChange,
  triggerRef,
  usePortal = false,
  "data-testid": testId = "dropdown-root"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(initialSelectedItem);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const defaultFilter = useCallback(
    (items2, query) => {
      if (!query.trim()) {
        return items2;
      }
      const normalizedQuery = query.toLowerCase().trim();
      return items2.filter((item) => getItemDisplay(item).toLowerCase().includes(normalizedQuery));
    },
    [getItemDisplay]
  );
  const filterFunction = filterItems || defaultFilter;
  const filteredItems = useMemo(() => {
    return filterFunction(items, searchQuery);
  }, [items, searchQuery, filterFunction]);
  const openDropdown = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    onOpenChange?.(true);
  }, [disabled, onOpenChange]);
  useLayoutEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSearchQuery("");
    onOpenChange?.(false);
  }, [onOpenChange]);
  const toggleDropdown = useCallback(() => {
    isOpen ? closeDropdown() : openDropdown();
  }, [isOpen, openDropdown, closeDropdown]);
  const handleSelect = useCallback(
    (item) => {
      setSelectedItem(item);
      onSelect(item);
      if (closeOnSelect) {
        closeDropdown();
      }
    },
    [onSelect, closeDropdown, closeOnSelect]
  );
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);
  useClickOutside(dropdownRef, closeDropdown, isOpen);
  const contextValue = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      selectedItem,
      setSelectedItem,
      searchQuery,
      setSearchQuery: handleSearchChange,
      items,
      filteredItems,
      getItemKey,
      getItemDisplay,
      filterItems: filterFunction,
      onSelect: handleSelect,
      disabled,
      closeOnSelect,
      closeDropdown,
      toggleDropdown,
      dropdownPlacement,
      getItemDescription,
      getItemIcon,
      getItemSection,
      getItemSeparator,
      getItemDisabled,
      getItemClassName,
      triggerRef,
      usePortal
    }),
    [
      isOpen,
      setIsOpen,
      selectedItem,
      setSelectedItem,
      searchQuery,
      handleSearchChange,
      items,
      filteredItems,
      getItemKey,
      getItemDisplay,
      filterFunction,
      handleSelect,
      disabled,
      closeOnSelect,
      closeDropdown,
      toggleDropdown,
      dropdownPlacement,
      getItemDescription,
      getItemIcon,
      getItemSection,
      getItemSeparator,
      getItemDisabled,
      getItemClassName,
      triggerRef,
      usePortal
    ]
  );
  return /* @__PURE__ */ jsx(DropdownProvider, { value: contextValue, children: /* @__PURE__ */ jsx("div", { ref: dropdownRef, className: `relative ${className}`, "data-testid": testId, children }) });
}
function DropdownTrigger({
  displayValue,
  placeholder = "Select an option",
  className = "",
  "data-testid": testId = "dropdown-trigger"
}) {
  const { isOpen, toggleDropdown, disabled } = useDropdownContext();
  const buildTriggerClassName = () => {
    const baseClasses = "w-full flex items-center justify-between px-3 py-2 text-left border border-gray-300 rounded-lg bg-white transition-colors";
    const interactiveClasses = "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0B4F75] focus-visible:border-transparent hover:border-gray-400 cursor-pointer";
    const disabledClasses = "opacity-50 cursor-not-allowed";
    return `${baseClasses} ${disabled ? disabledClasses : interactiveClasses}`;
  };
  const buildTextClassName = () => {
    return displayValue ? "text-gray-900" : "text-gray-400";
  };
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick: toggleDropdown,
      disabled,
      className: `${buildTriggerClassName()} ${className}`,
      "aria-haspopup": "listbox",
      "aria-expanded": isOpen,
      "aria-label": displayValue ? void 0 : placeholder || "Select an option",
      "data-testid": testId,
      children: [
        /* @__PURE__ */ jsx("span", { className: buildTextClassName(), children: displayValue || placeholder }),
        /* @__PURE__ */ jsx(DropdownArrowIcon, { isOpen })
      ]
    }
  );
}
function DropdownArrowIcon({ isOpen }) {
  return /* @__PURE__ */ jsx(
    "svg",
    {
      className: `size-4 transition-transform ${isOpen ? "rotate-180" : ""}`,
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24",
      "aria-hidden": "true",
      children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
    }
  );
}

// src/design-tokens.ts
var ELEVATED_SHADOW = "0px 0px 0px 1px rgba(0,0,0,0.03), 0px 1px 1px 0px rgba(0,0,0,0.03), 0px 2px 2px 0px rgba(0,0,0,0.03), 0px 4px 4px 0px rgba(0,0,0,0.03), 0px 8px 8px 0px rgba(0,0,0,0.03), 0px 16px 16px 0px rgba(0,0,0,0.03)";
var EXIT_ANIMATION_DURATION_MS = 150;
function DropdownContent({
  children,
  className = "",
  disableAnimation = false,
  "data-testid": testId = "dropdown-content"
}) {
  const { isOpen, dropdownPlacement, triggerRef, usePortal } = useDropdownContext();
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [portalPosition, setPortalPosition] = useState({ top: 0, right: 0 });
  const prevIsOpen = useRef(isOpen);
  useEffect(() => {
    if (usePortal && isOpen && triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPortalPosition({
        top: rect.bottom + 4,
        // 4px gap below trigger
        right: window.innerWidth - rect.right
        // Align dropdown's right edge with trigger's right edge
      });
    }
  }, [isOpen, usePortal, triggerRef]);
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (prevIsOpen.current && !isOpen) {
      if (disableAnimation) {
        setShouldRender(false);
      } else {
        setIsClosing(true);
        const timer = setTimeout(() => {
          setShouldRender(false);
          setIsClosing(false);
        }, EXIT_ANIMATION_DURATION_MS);
        return () => clearTimeout(timer);
      }
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, disableAnimation]);
  const placementClass = dropdownPlacement === "top" ? "bottom-full mb-1" : "mt-1";
  const flexDirClass = dropdownPlacement === "top" ? "flex-col-reverse" : "flex-col";
  const transformOrigin = dropdownPlacement === "top" ? "bottom center" : "top center";
  const variants = {
    initial: {
      opacity: 0,
      scale: 0.95,
      y: dropdownPlacement === "top" ? 8 : -8
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      boxShadow: ELEVATED_SHADOW
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: dropdownPlacement === "top" ? 8 : -8
    }
  };
  const content = /* @__PURE__ */ jsx(AnimatePresence, { children: shouldRender && /* @__PURE__ */ jsx(
    motion.div,
    {
      className: `${usePortal ? "fixed" : "absolute"} z-50 ${usePortal ? "" : "w-full"} ${usePortal ? "" : "min-w-[320px]!"} ${usePortal ? "" : placementClass} bg-white border border-gray-200 rounded-lg flex ${flexDirClass} overflow-hidden ${className}`,
      style: usePortal ? { top: portalPosition.top, right: portalPosition.right, transformOrigin } : { transformOrigin },
      initial: disableAnimation ? false : "initial",
      animate: "animate",
      exit: disableAnimation ? void 0 : "exit",
      variants,
      transition: {
        duration: 0.15,
        ease: [0.16, 1, 0.3, 1]
        // Custom ease for smooth feel
      },
      "data-testid": testId,
      children
    }
  ) });
  if (usePortal && typeof document !== "undefined") {
    return createPortal(content, document.body);
  }
  return content;
}
var DropdownSearch = ({
  value,
  onChange,
  inputRef,
  placeholder = "Search...",
  className = "",
  "data-testid": testId = "dropdown-search"
}) => {
  const { disabled } = useDropdownContext();
  const handleKeyDown = (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
    }
  };
  return /* @__PURE__ */ jsx("div", { className: `px-2 py-1 border-b border-gray-200 shrink-0 ${className}`, children: /* @__PURE__ */ jsx(
    "input",
    {
      ref: inputRef,
      type: "text",
      value,
      onChange: (e) => onChange(e.target.value),
      onKeyDown: handleKeyDown,
      placeholder,
      disabled,
      className: "w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0B4F75] focus-visible:border-transparent",
      tabIndex: -1,
      "data-testid": testId,
      "aria-label": "Search options"
    }
  ) });
};
var groupItemsBySection = (items, resolveSection) => {
  if (!resolveSection) {
    return { sections: [], ungrouped: items };
  }
  const sectionIndex = /* @__PURE__ */ new Map();
  const sections = [];
  const ungrouped = [];
  items.forEach((item) => {
    const section = resolveSection(item);
    if (!section) {
      ungrouped.push(item);
      return;
    }
    const existingIndex = sectionIndex.get(section.key);
    if (existingIndex === void 0) {
      sectionIndex.set(section.key, sections.length);
      sections.push({ meta: section, items: [item] });
      return;
    }
    sections[existingIndex].items.push(item);
  });
  return { sections, ungrouped };
};
function DropdownList({
  items,
  onSelect: customOnSelect,
  hasResults,
  selectedItem,
  getItemKey,
  getItemDisplay,
  renderItem,
  getItemDescription,
  getItemIcon,
  getItemSection,
  getItemSeparator,
  getItemDisabled,
  getItemClassName,
  className = "",
  "data-testid": testId = "dropdown-list"
}) {
  const {
    isOpen,
    getItemDescription: contextDescription,
    getItemIcon: contextIcon,
    getItemSection: contextSection,
    getItemSeparator: contextSeparator,
    getItemDisabled: contextDisabled,
    getItemClassName: contextClassName,
    onSelect: contextOnSelect,
    closeDropdown,
    closeOnSelect
  } = useDropdownContext();
  const listRef = useRef(null);
  const prevIsOpenRef = useRef(isOpen);
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current && listRef.current && selectedItem) {
      const selectedElement = listRef.current.querySelector(
        `[data-key="${getItemKey(selectedItem)}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "auto",
          block: "start"
        });
      }
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, selectedItem, getItemKey]);
  const descriptionAccessor = getItemDescription ?? contextDescription;
  const iconAccessor = getItemIcon ?? contextIcon;
  const sectionAccessor = getItemSection ?? contextSection;
  const separatorAccessor = getItemSeparator ?? contextSeparator;
  const disabledAccessor = getItemDisabled ?? contextDisabled;
  const classNameAccessor = getItemClassName ?? contextClassName;
  const groupedItems = useMemo(
    () => groupItemsBySection(items, sectionAccessor),
    [items, sectionAccessor]
  );
  const resolveDescription = (item) => {
    if (!descriptionAccessor) {
      return null;
    }
    return descriptionAccessor(item) ?? null;
  };
  const resolveIcon = (item) => {
    if (!iconAccessor) {
      return void 0;
    }
    return iconAccessor(item);
  };
  const renderSectionHeader = (section) => {
    return /* @__PURE__ */ jsx(
      "li",
      {
        role: "presentation",
        className: "px-3 py-2 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500",
        children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            section.meta.icon && /* @__PURE__ */ jsx("span", { className: "text-base text-gray-500", "aria-hidden": true, children: section.meta.icon }),
            /* @__PURE__ */ jsx("span", { children: section.meta.label })
          ] }),
          section.meta.description && /* @__PURE__ */ jsx("span", { className: "text-[11px] font-normal normal-case text-gray-400", children: section.meta.description })
        ] })
      },
      `section-${section.meta.key}`
    );
  };
  const resolvedOnSelect = useMemo(() => {
    const selectHandler = customOnSelect || contextOnSelect;
    return (item) => {
      selectHandler(item);
      if (closeOnSelect) {
        closeDropdown();
      }
    };
  }, [customOnSelect, contextOnSelect, closeOnSelect, closeDropdown]);
  const renderOption = (item) => {
    const key = getItemKey(item);
    const displayText = getItemDisplay(item);
    const isSelected = selectedItem ? getItemKey(selectedItem) === key : false;
    const isDisabled = disabledAccessor ? disabledAccessor(item) : false;
    const customClassName = classNameAccessor ? classNameAccessor(item, isSelected, isDisabled) : "";
    if (renderItem) {
      return /* @__PURE__ */ jsx("li", { "data-key": key, children: renderItem(item, isSelected, resolvedOnSelect) }, key);
    }
    return /* @__PURE__ */ jsx("li", { "data-key": key, children: /* @__PURE__ */ jsx(
      DropdownOption,
      {
        dataKey: key,
        item,
        onSelect: resolvedOnSelect,
        isSelected,
        displayText,
        description: resolveDescription(item),
        icon: resolveIcon(item),
        isDisabled,
        className: customClassName
      }
    ) }, key);
  };
  if (!hasResults) {
    return /* @__PURE__ */ jsx("div", { className: `p-4 text-center text-sm text-gray-500 ${className}`, children: "No results found" });
  }
  const renderedItems = [];
  groupedItems.ungrouped.forEach((item) => {
    const originalIndex = items.findIndex((i) => getItemKey(i) === getItemKey(item));
    renderedItems.push(renderOption(item));
    if (separatorAccessor && originalIndex >= 0 && separatorAccessor(item, originalIndex)) {
      renderedItems.push(
        /* @__PURE__ */ jsx(
          "li",
          {
            role: "separator",
            className: "border-b border-gray-200 my-1"
          },
          `separator-${originalIndex}`
        )
      );
    }
  });
  groupedItems.sections.forEach((section) => {
    renderedItems.push(renderSectionHeader(section));
    section.items.forEach((item) => {
      const originalIndex = items.findIndex((i) => getItemKey(i) === getItemKey(item));
      renderedItems.push(renderOption(item));
      if (separatorAccessor && originalIndex >= 0 && separatorAccessor(item, originalIndex)) {
        renderedItems.push(
          /* @__PURE__ */ jsx(
            "li",
            {
              role: "separator",
              className: "border-b border-gray-200 my-1"
            },
            `separator-${originalIndex}`
          )
        );
      }
    });
  });
  return /* @__PURE__ */ jsx(
    "ul",
    {
      ref: listRef,
      className: `overflow-y-auto flex-1 min-h-0 flex flex-col no-scrollbar ${className}`,
      role: "listbox",
      "data-testid": testId,
      children: renderedItems
    }
  );
}
function DropdownOption({
  item,
  onSelect,
  isSelected,
  displayText,
  dataKey,
  description,
  icon,
  isDisabled = false,
  className = ""
}) {
  const [isHovered, setIsHovered] = useState(false);
  const handleClick = () => {
    if (!isDisabled) {
      onSelect(item);
    }
  };
  const baseClasses = "px-3 py-1.5 text-sm transition-colors";
  const selectedClasses = isSelected ? "bg-blue-50 text-blue-600 font-medium" : "";
  const hasCustomHover = className.includes("hover:");
  const disabledClasses = isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
  const classNameWithoutHover = className.replace(/hover:[^\s]+/g, "").trim();
  const combinedClasses = `${baseClasses} ${selectedClasses} ${disabledClasses} ${classNameWithoutHover}`.trim();
  const hoverBgMatch = className.match(/hover:!?bg-\[([^\]]+)\]/);
  const hoverBgColor = hoverBgMatch ? hoverBgMatch[1] : hasCustomHover ? "#fee2e2" : "#f3f4f6";
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-key": dataKey,
      onClick: handleClick,
      className: combinedClasses,
      style: isHovered && !isDisabled ? { backgroundColor: hoverBgColor } : void 0,
      role: "option",
      "aria-selected": isSelected,
      "aria-disabled": isDisabled,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col flex-1", children: [
          /* @__PURE__ */ jsx("span", { children: displayText }),
          description && /* @__PURE__ */ jsx("span", { className: "text-xs font-normal text-gray-500", children: description })
        ] }),
        icon && /* @__PURE__ */ jsx("span", { className: "text-base", "aria-hidden": true, children: icon })
      ] })
    }
  );
}
function DropdownSearchable({
  searchPlaceholder = "Search...",
  className = "",
  "data-testid": testId = "dropdown-searchable",
  hideSearchThreshold
}) {
  const {
    searchQuery,
    setSearchQuery,
    filteredItems,
    selectedItem,
    getItemKey,
    getItemDisplay,
    getItemDescription,
    getItemIcon,
    getItemSection,
    items
  } = useDropdownContext();
  const shouldShowSearch = hideSearchThreshold === void 0 || items.length > hideSearchThreshold;
  return /* @__PURE__ */ jsxs(DropdownContent, { className, "data-testid": testId, children: [
    shouldShowSearch && /* @__PURE__ */ jsx(
      DropdownSearch,
      {
        value: searchQuery,
        onChange: setSearchQuery,
        placeholder: searchPlaceholder
      }
    ),
    /* @__PURE__ */ jsx(
      DropdownList,
      {
        items: filteredItems,
        hasResults: filteredItems.length > 0,
        selectedItem,
        getItemKey,
        getItemDisplay,
        getItemDescription,
        getItemIcon,
        getItemSection
      }
    )
  ] });
}
function DropdownSimple({
  className = "",
  "data-testid": testId = "dropdown-simple"
}) {
  const {
    filteredItems,
    selectedItem,
    getItemKey,
    getItemDisplay,
    getItemDescription,
    getItemIcon,
    getItemSection
  } = useDropdownContext();
  return /* @__PURE__ */ jsx(DropdownContent, { className, "data-testid": testId, children: /* @__PURE__ */ jsx(
    DropdownList,
    {
      items: filteredItems,
      hasResults: filteredItems.length > 0,
      selectedItem,
      getItemKey,
      getItemDisplay,
      getItemDescription,
      getItemIcon,
      getItemSection
    }
  ) });
}
var MenuTrigger = React2.forwardRef(
  ({ children }, ref) => {
    const { isOpen, toggleDropdown } = useDropdownContext();
    return /* @__PURE__ */ jsx("div", { ref, onClick: toggleDropdown, "aria-expanded": isOpen, "aria-haspopup": "menu", children });
  }
);
MenuTrigger.displayName = "MenuTrigger";
function DropdownMenu({
  items,
  onSelect,
  getItemKey,
  getItemDisplay,
  getItemIcon,
  getItemDescription,
  getItemSeparator,
  getItemDisabled,
  getItemClassName,
  getItemSection,
  filterItems,
  disabled = false,
  placeholder,
  className = "",
  dropdownPlacement = "bottom",
  closeOnSelect = true,
  trigger,
  contentClassName = "",
  listClassName = "",
  onOpenChange,
  usePortal = false,
  "data-testid": testId = "dropdown-menu"
}) {
  const triggerRef = useRef(null);
  return /* @__PURE__ */ jsxs(
    DropdownRoot,
    {
      items,
      selectedItem: null,
      onSelect,
      getItemKey,
      getItemDisplay,
      getItemIcon,
      getItemDescription,
      getItemSeparator,
      getItemDisabled,
      getItemClassName,
      getItemSection,
      filterItems,
      disabled,
      placeholder,
      className,
      dropdownPlacement,
      closeOnSelect,
      onOpenChange,
      triggerRef,
      usePortal,
      "data-testid": testId,
      children: [
        /* @__PURE__ */ jsx(MenuTrigger, { ref: triggerRef, children: trigger }),
        /* @__PURE__ */ jsx(DropdownContent, { className: contentClassName, children: /* @__PURE__ */ jsx(
          DropdownList,
          {
            items,
            hasResults: items.length > 0,
            selectedItem: null,
            getItemKey,
            getItemDisplay,
            getItemIcon,
            getItemDescription,
            getItemSeparator,
            getItemDisabled,
            getItemClassName,
            getItemSection,
            className: listClassName
          }
        ) })
      ]
    }
  );
}

// src/index.ts
var Dropdown = {
  Root: DropdownRoot,
  Trigger: DropdownTrigger,
  Content: DropdownContent,
  Search: DropdownSearch,
  List: DropdownList,
  Simple: DropdownSimple,
  Searchable: DropdownSearchable,
  Menu: DropdownMenu
};
var src_default = Dropdown;

export { DropdownContent, DropdownList, DropdownMenu, DropdownProvider, DropdownRoot, DropdownSearch, DropdownSearchable, DropdownSimple, DropdownTrigger, src_default as default, useClickOutside, useDropdownContext, useKeyboardNavigation };
