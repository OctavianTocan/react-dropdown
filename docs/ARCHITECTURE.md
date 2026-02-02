# Architecture Documentation

Technical architecture and design decisions for `@octavian-tocan/react-dropdown`.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Component Hierarchy](#component-hierarchy)
- [State Management](#state-management)
- [Data Flow](#data-flow)
- [Design Patterns](#design-patterns)
- [Animation System](#animation-system)
- [Accessibility](#accessibility)
- [Performance Considerations](#performance-considerations)

---

## Overview

The React Dropdown library is built as a composable component system using the **Compound Component Pattern**. This architecture enables:

- **Flexibility**: Mix and match components for custom layouts
- **Simplicity**: Use pre-built components for common use cases
- **Type Safety**: Full TypeScript generics support
- **Accessibility**: Built-in ARIA attributes and keyboard navigation
- **Performance**: Optimized rendering with React hooks and memoization

### Technology Stack

| Technology             | Purpose      |
| ---------------------- | ------------ |
| React 18/19            | UI Framework |
| TypeScript 5           | Type Safety  |
| Motion (Framer Motion) | Animations   |
| Tailwind CSS           | Styling      |
| Vitest                 | Testing      |
| tsup                   | Build Tool   |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Application Layer                               │
│                                                                              │
│    ┌──────────────────────────────────────────────────────────────────┐    │
│    │                         DropdownRoot                              │    │
│    │  ┌────────────────────────────────────────────────────────────┐  │    │
│    │  │                    DropdownProvider                         │  │    │
│    │  │                   (Context Provider)                        │  │    │
│    │  │                                                             │  │    │
│    │  │  ┌─────────────┐  ┌──────────────────────────────────────┐ │  │    │
│    │  │  │   Trigger   │  │         DropdownContent              │ │  │    │
│    │  │  │   Button    │  │  ┌────────────────────────────────┐  │ │  │    │
│    │  │  │             │  │  │         DropdownHeader         │  │ │  │    │
│    │  │  │  [Toggle]   │  │  ├────────────────────────────────┤  │ │  │    │
│    │  │  │             │  │  │         DropdownSearch         │  │ │  │    │
│    │  │  └─────────────┘  │  ├────────────────────────────────┤  │ │  │    │
│    │  │                    │  │         DropdownList           │  │ │  │    │
│    │  │                    │  │  ┌────────────────────────┐    │  │ │  │    │
│    │  │                    │  │  │   Section Headers      │    │  │ │  │    │
│    │  │                    │  │  │   DropdownOption(s)    │    │  │ │  │    │
│    │  │                    │  │  │   Separators           │    │  │ │  │    │
│    │  │                    │  │  └────────────────────────┘    │  │ │  │    │
│    │  │                    │  ├────────────────────────────────┤  │ │  │    │
│    │  │                    │  │         DropdownFooter         │  │ │  │    │
│    │  │                    │  └────────────────────────────────┘  │ │  │    │
│    │  │                    └──────────────────────────────────────┘ │  │    │
│    │  └────────────────────────────────────────────────────────────┘  │    │
│    └──────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

### Core Components

```
Dropdown (Compound Export)
├── Root          → State management provider
├── Trigger       → Toggle button
├── Content       → Animated container
├── Search        → Filter input
├── List          → Scrollable item list
├── Header        → Fixed header section
├── Footer        → Fixed footer section
├── Simple        → Pre-built: List only
├── Searchable    → Pre-built: Search + List
└── Menu          → Pre-built: Action menu variant
```

### Dependency Graph

```
                    DropdownRoot
                         │
                         ▼
                  DropdownProvider ──────────────────────┐
                    (Context)                            │
                         │                               │
          ┌──────────────┼──────────────┐               │
          ▼              ▼              ▼               │
    DropdownTrigger  DropdownContent  DropdownMenu      │
                         │                               │
          ┌──────────────┼──────────────┐               │
          ▼              ▼              ▼               │
   DropdownHeader  DropdownSearch  DropdownList         │
                                        │               │
                                        ▼               │
                                 DropdownOption         │
                                        │               │
                                        └───────────────┘
                                     useDropdownContext
```

---

## State Management

### Context Structure

The `DropdownContext` manages all shared state:

```typescript
interface DropdownContextValue<T> {
    // Core State
    isOpen: boolean;
    selectedItem: T | null;
    searchQuery: string;
    filteredItems: T[];
    animationState: "entering" | "exiting" | "idle";

    // Computed Values
    computedPlacement: "top" | "bottom";

    // State Setters
    setIsOpen: (open: boolean) => void;
    setSelectedItem: (item: T | null) => void;
    setSearchQuery: (query: string) => void;

    // Actions
    onSelect: (item: T) => void;
    closeDropdown: () => void;
    closeImmediate: () => void;
    toggleDropdown: () => void;

    // Configuration
    items: T[];
    disabled: boolean;
    closeOnSelect: boolean;
    offset: number;
    enterDuration: number;
    exitDuration: number;

    // Accessor Functions
    getItemKey: (item: T) => string;
    getItemDisplay: (item: T) => string;
    filterItems: (items: T[], query: string) => T[];
    getItemDescription?: (item: T) => string | null;
    getItemIcon?: (item: T) => ReactNode;
    getItemSection?: (item: T) => DropdownSectionMeta | null;
    getItemSeparator?: (item: T, index: number) => boolean;
    getItemDisabled?: (item: T) => boolean;
    getItemClassName?: (
        item: T,
        isSelected: boolean,
        isDisabled: boolean,
    ) => string;
}
```

### State Flow Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                        DropdownRoot                                 │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      Internal State                          │   │
│  │                                                              │   │
│  │   isOpen ─────────┬──────────────────────────────────────┐  │   │
│  │   selectedItem ───┤                                      │  │   │
│  │   searchQuery ────┤      DropdownContextValue            │  │   │
│  │   animationState ─┤        (memoized)                    │  │   │
│  │   computedPlacement─┘                                    │  │   │
│  │                                                          │  │   │
│  └──────────────────────────────────────────────────────────┘  │   │
│                              │                                  │   │
│                              ▼                                  │   │
│                     DropdownProvider                            │   │
│                              │                                  │   │
└──────────────────────────────┼──────────────────────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
   Trigger               Content/List              Hooks
  (toggles)           (consumes state)      (useDropdownContext)
       │                       │                       │
       ▼                       ▼                       ▼
   User Click            Item Select           Custom Components
       │                       │
       └───────────────────────┘
                   │
                   ▼
            State Update
                   │
                   ▼
            Re-render
```

---

## Data Flow

### Selection Flow

```
User clicks item
       │
       ▼
DropdownOption.onClick
       │
       ▼
context.onSelect(item)
       │
       ├──► setSelectedItem(item)
       │
       ├──► props.onSelect(item)  ──► Parent component
       │
       └──► if (closeOnSelect)
                  │
                  ▼
            closeDropdown()
                  │
                  ├──► setAnimationState('exiting')
                  │
                  └──► setTimeout(() => {
                          setIsOpen(false)
                          setSearchQuery('')
                          setAnimationState('idle')
                        }, exitDuration)
```

### Search/Filter Flow

```
User types in search
       │
       ▼
DropdownSearch.onChange
       │
       ▼
context.setSearchQuery(query)
       │
       ▼
useMemo recalculates filteredItems
       │
       ▼
filterFunction(items, searchQuery)
       │
       ▼
DropdownList receives new filteredItems
       │
       ▼
Re-render with filtered results
```

### Placement Detection Flow

```
Dropdown opens
       │
       ▼
Check placement prop
       │
       ├─── 'top' or 'bottom' ──► Use directly
       │
       └─── 'auto' ──► Detect trigger position
                              │
                              ▼
                    Get trigger bounding rect
                              │
                              ▼
                    Calculate viewport position
                              │
                              ├─── Lower half ──► 'top'
                              │
                              └─── Upper half ──► 'bottom'
```

---

## Design Patterns

### 1. Compound Component Pattern

Components are designed to work together while remaining independently usable:

```tsx
// Compound usage
<Dropdown.Root items={items} {...config}>
  <Dropdown.Trigger displayValue={selected?.name} />
  <Dropdown.Content>
    <Dropdown.Header>Title</Dropdown.Header>
    <Dropdown.Search {...searchProps} />
    <Dropdown.List {...listProps} />
    <Dropdown.Footer>Actions</Dropdown.Footer>
  </Dropdown.Content>
</Dropdown.Root>

// Pre-built composition
<Dropdown.Root items={items} {...config}>
  <Dropdown.Trigger displayValue={selected?.name} />
  <Dropdown.Searchable />
</Dropdown.Root>
```

### 2. Inversion of Control

Parent provides accessor functions, components remain generic:

```tsx
<DropdownRoot
    items={users}
    getItemKey={(user) => user.id} // How to identify
    getItemDisplay={(user) => user.name} // What to show
    getItemIcon={(user) => <Avatar />} // How to render icon
    getItemSection={(user) => user.team} // How to group
    getItemDisabled={(user) => user.inactive} // When disabled
/>
```

### 3. Context-Based State Sharing

All components access shared state via `useDropdownContext`:

```tsx
function CustomComponent<T>() {
    const { isOpen, filteredItems, onSelect, closeDropdown } =
        useDropdownContext<T>();

    // Build custom UI...
}
```

### 4. Render Props for Custom Rendering

`DropdownList` supports custom item rendering:

```tsx
<DropdownList
    renderItem={(item, isSelected, onSelect) => (
        <CustomItem
            item={item}
            selected={isSelected}
            onClick={() => onSelect(item)}
        />
    )}
/>
```

---

## Animation System

### Motion Integration

Animations are powered by Motion (Framer Motion):

```typescript
// Animation variants based on placement
const getVariants = (placement: "top" | "bottom") => ({
    hidden: {
        opacity: 0,
        y: placement === "bottom" ? -8 : 8,
        scale: 0.96,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
    },
});
```

### Animation States

```
┌─────────┐     open()      ┌──────────┐     animation     ┌──────┐
│  idle   │ ───────────────►│ entering │ ────complete─────►│ idle │
│ (closed)│                 │          │                    │(open)│
└─────────┘                 └──────────┘                    └──────┘
     ▲                                                           │
     │                                                           │
     │         ┌──────────┐     animation                        │
     └─────────│ exiting  │◄────complete────────close()──────────┘
               │          │
               └──────────┘
```

### Design Tokens

```typescript
// Elevated shadow for floating elements
export const ELEVATED_SHADOW =
    "0px 0px 0px 1px rgba(0,0,0,0.03), " +
    "0px 1px 1px 0px rgba(0,0,0,0.03), " +
    "0px 2px 2px 0px rgba(0,0,0,0.03), " +
    "0px 4px 4px 0px rgba(0,0,0,0.03), " +
    "0px 8px 8px 0px rgba(0,0,0,0.03), " +
    "0px 16px 16px 0px rgba(0,0,0,0.03)";

// Default animation durations
const enterDuration = 0.2; // seconds
const exitDuration = 0.15; // seconds
```

---

## Accessibility

### ARIA Attributes

| Component | Attribute       | Value            |
| --------- | --------------- | ---------------- |
| Trigger   | `aria-haspopup` | `"listbox"`      |
| Trigger   | `aria-expanded` | `true/false`     |
| Content   | `role`          | `"listbox"`      |
| Option    | `role`          | `"option"`       |
| Option    | `aria-selected` | `true/false`     |
| Option    | `aria-disabled` | `true/false`     |
| Search    | `aria-label`    | `"Search items"` |

### Keyboard Navigation

| Key               | Action                                 |
| ----------------- | -------------------------------------- |
| `Enter` / `Space` | Toggle dropdown or select focused item |
| `ArrowDown`       | Move focus to next item                |
| `ArrowUp`         | Move focus to previous item            |
| `Escape`          | Close dropdown                         |
| `Tab`             | Close dropdown (prevented in search)   |

### Focus Management

```
Dropdown opens
       │
       ▼
useLayoutEffect focuses search input
       │
       ▼
Tab key prevented (stays in dropdown)
       │
       ▼
Arrow keys navigate items
       │
       ▼
Escape or click outside closes
       │
       ▼
Focus returns to trigger
```

---

## Performance Considerations

### Memoization Strategy

```typescript
// Filtered items memoized
const filteredItems = useMemo(() => {
    return filterFunction(items, searchQuery);
}, [items, searchQuery, filterFunction]);

// Context value memoized
const contextValue = useMemo(
    () => ({
        // All context values...
    }),
    [
        /* dependencies */
    ],
);
```

### Optimization Techniques

1. **Lazy Rendering**: Content only renders when `isOpen` is true
2. **Portal Rendering**: Optional portal avoids layout calculations
3. **Event Delegation**: Click outside uses single document listener
4. **Passive Events**: Touch events marked as passive
5. **Tree Shaking**: ESM exports enable dead code elimination

### Bundle Size

| Export       | Type              |
| ------------ | ----------------- |
| ESM          | `dist/index.js`   |
| CJS          | `dist/index.cjs`  |
| Types        | `dist/index.d.ts` |
| Side Effects | `false`           |

External dependencies (not bundled):

- `react`
- `react-dom`
- `motion`

---

## File Structure

```
src/
├── index.ts                 # Barrel exports
├── types.ts                 # TypeScript interfaces
├── design-tokens.ts         # Shadow, animation constants
│
├── DropdownRoot.tsx         # State management provider
├── DropdownContext.tsx      # Context + hooks
├── DropdownTrigger.tsx      # Toggle button
├── DropdownContent.tsx      # Animated container
├── DropdownSearch.tsx       # Filter input
├── DropdownList.tsx         # Item list
├── DropdownHeader.tsx       # Fixed header
├── DropdownFooter.tsx       # Fixed footer
│
├── DropdownSearchable.tsx   # Pre-built: Search + List
├── DropdownSimple.tsx       # Pre-built: List only
├── DropdownMenu.tsx         # Pre-built: Action menu
│
├── __tests__/               # Component tests
├── __stories__/             # Storybook stories
└── test-utils/              # Test helpers
```
