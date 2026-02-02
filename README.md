# @octavian-tocan/react-dropdown

[![npm version](https://img.shields.io/npm/v/@octavian-tocan/react-dropdown.svg)](https://www.npmjs.com/package/@octavian-tocan/react-dropdown)
[![license](https://img.shields.io/npm/l/@octavian-tocan/react-dropdown.svg)](https://github.com/OctavianTocan/react-dropdown/blob/main/LICENSE)

A flexible, composable dropdown (select) component system for React with TypeScript support. Built with accessibility in mind and featuring smooth animations powered by Motion (the latest version of Framer Motion).

## Features

- 🎯 **Composable API** - Mix and match components or use pre-made convenience components
- 🔍 **Searchable** - Built-in search/filter functionality
- ♿ **Accessible** - Proper ARIA attributes and keyboard navigation
- 🎨 **Customizable** - Support for icons, descriptions, sections, and custom styling
- 📱 **Portal Support** - Render dropdowns in portals to avoid overflow clipping
- 🎭 **Type-Safe** - Full TypeScript support with generics
- ⚡ **Performant** - Optimized with React hooks and memoization

## Installation

```bash
npm install @octavian-tocan/react-dropdown
# or
pnpm add @octavian-tocan/react-dropdown
# or
yarn add @octavian-tocan/react-dropdown
```

## Peer Dependencies

This package requires:

- `react` >= 18
- `react-dom` >= 18
- `motion` >= 12 (Motion for React - the latest version of Framer Motion)

## Quick Start (Copy & Paste)

Copy this complete example to get started immediately:

```tsx
import { useState } from "react";
import Dropdown from "@octavian-tocan/react-dropdown";

const items = [
  { id: "1", label: "Option 1" },
  { id: "2", label: "Option 2" },
  { id: "3", label: "Option 3" },
];

export function MyDropdown() {
  const [selected, setSelected] = useState<(typeof items)[0] | null>(null);

  return (
    <Dropdown.Root
      items={items}
      selectedItem={selected}
      onSelect={setSelected}
      getItemKey={(item) => item.id}
      getItemDisplay={(item) => item.label}
    >
      <Dropdown.Trigger displayValue={selected?.label ?? ""} placeholder="Select an option..." />
      <Dropdown.Simple />
    </Dropdown.Root>
  );
}
```

## Documentation

- [Live Storybook](https://octaviantocan.github.io/react-dropdown) <!-- TODO: Update after deployment -->
- [API Reference](./docs/API.md)
- [Examples](./docs/EXAMPLES.md)
- [Architecture](./docs/ARCHITECTURE.md)

## Usage Examples

### Searchable Dropdown

```tsx
import Dropdown from "@octavian-tocan/react-dropdown";

function MyComponent() {
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
  ];

  return (
    <Dropdown.Root
      items={languages}
      selectedItem={selectedLanguage}
      onSelect={setSelectedLanguage}
      getItemKey={(lang) => lang.code}
      getItemDisplay={(lang) => lang.name}
    >
      <Dropdown.Trigger displayValue={selectedLanguage?.name || ""} />
      <Dropdown.Searchable searchPlaceholder="Search languages..." />
    </Dropdown.Root>
  );
}
```

### Simple Dropdown (No Search)

```tsx
<Dropdown.Root items={priorities} {...config}>
  <Dropdown.Trigger displayValue={priority?.label || ""} />
  <Dropdown.Simple />
</Dropdown.Root>
```

### Action Menu

```tsx
import Dropdown from "@octavian-tocan/react-dropdown";
import { MoreHorizontal } from "lucide-react";

function MenuExample() {
  const menuItems = [
    { id: "1", label: "Edit", icon: <Edit />, onClick: handleEdit },
    { id: "2", label: "Delete", icon: <Trash />, onClick: handleDelete, showSeparator: true },
  ];

  return (
    <Dropdown.Menu
      items={menuItems}
      trigger={<MoreHorizontal />}
      onSelect={(item) => item.onClick()}
      getItemKey={(item) => item.id}
      getItemDisplay={(item) => item.label}
      getItemIcon={(item) => item.icon}
      getItemSeparator={(item) => item.showSeparator ?? false}
    />
  );
}
```

## API Reference

### Compound Components

The package exports a compound component `Dropdown` with the following sub-components:

- **`Dropdown.Root`** - Provider component that manages all state
- **`Dropdown.Trigger`** - Button that opens/closes the dropdown
- **`Dropdown.Content`** - Container for custom compositions
- **`Dropdown.Search`** - Search input component
- **`Dropdown.List`** - Scrollable list of options
- **`Dropdown.Simple`** - Pre-made dropdown with list only
- **`Dropdown.Searchable`** - Pre-made dropdown with search + list
- **`Dropdown.Menu`** - Action menu variant

### Hooks

- **`useDropdownContext<T>()`** - Access dropdown context (throws if used outside Root)
- **`useKeyboardNavigation<T>(items, getItemKey, onSelect, closeDropdown)`** - Keyboard navigation helpers
- **`useClickOutside(ref, closeDropdown, isOpen)`** - Click outside detection

### Types

All TypeScript types are exported. Key types include:

- `DropdownRootProps<T>`
- `DropdownTriggerProps`
- `DropdownListProps<T>`
- `DropdownMenuProps<T>`
- `DropdownContextValue<T>`
- `DropdownSectionMeta`
- `DropdownPlacement`

## Advanced Usage

### Custom Composition

Build your own dropdown layout:

```tsx
<Dropdown.Content>
  <CustomHeader />
  <Dropdown.Search placeholder="Filter..." />
  <Dropdown.List />
  <CustomFooter />
</Dropdown.Content>
```

### Sections and Grouping

Group items into sections with headers:

```tsx
<Dropdown.Root
  items={items}
  getItemSection={(item) => ({
    key: item.category,
    label: item.category,
    icon: '📁',
  })}
  // ...
>
```

### Icons and Descriptions

Add icons and descriptions to items:

```tsx
<Dropdown.Root
  items={items}
  getItemIcon={(item) => <Icon name={item.icon} />}
  getItemDescription={(item) => item.description}
  // ...
>
```

### Portal Rendering

Render dropdown in a portal to avoid overflow clipping:

```tsx
<Dropdown.Root
  items={items}
  usePortal={true}
  triggerRef={triggerRef}
  // ...
>
```

### Placement Control

Control dropdown placement (top or bottom):

```tsx
<Dropdown.Root
  items={items}
  dropdownPlacement="top"  // or "bottom" (default)
  // ...
>
```

### Hiding Search for Small Lists

Hide search input for small lists:

```tsx
<Dropdown.Searchable hideSearchThreshold={4} />
```

When `items.length <= hideSearchThreshold`, search is hidden.

## Examples

See the [Storybook stories](./*.stories.tsx) for comprehensive examples covering:

- Simple dropdowns
- Searchable dropdowns
- Action menus
- Custom compositions
- Sections and grouping
- Icons and descriptions
- Disabled items
- Portal rendering
- Placement options

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Type check
pnpm typecheck

# Run tests
pnpm test

# Watch mode
pnpm dev
```

## License

MIT

## Repository

[https://github.com/OctavianTocan/react-dropdown](https://github.com/OctavianTocan/react-dropdown)
