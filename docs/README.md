# Documentation

Welcome to the `@octavian-tocan/react-dropdown` documentation.

## Quick Links

| Document                              | Description                                            |
| ------------------------------------- | ------------------------------------------------------ |
| [**API Reference**](./API.md)         | Complete component props, hooks, and type definitions  |
| [**Architecture**](./ARCHITECTURE.md) | Technical architecture, design patterns, and data flow |
| [**Examples**](./EXAMPLES.md)         | Practical examples and common use case recipes         |
| [**Contributing**](./CONTRIBUTING.md) | Development setup and contribution guidelines          |

## Overview

`@octavian-tocan/react-dropdown` is a flexible, composable dropdown component system for React. It provides:

- **Compound Component Pattern** - Mix and match components for custom layouts
- **Pre-built Components** - Ready-to-use components for common use cases
- **Full TypeScript Support** - Type-safe with generics
- **Accessibility** - ARIA attributes and keyboard navigation
- **Smooth Animations** - Powered by Motion (Framer Motion)

## Quick Start

```bash
npm install @octavian-tocan/react-dropdown
```

```tsx
import Dropdown from "@octavian-tocan/react-dropdown";

function MyComponent() {
    const [selected, setSelected] = useState(null);
    const items = [
        { id: "1", name: "Option 1" },
        { id: "2", name: "Option 2" },
        { id: "3", name: "Option 3" },
    ];

    return (
        <Dropdown.Root
            items={items}
            selectedItem={selected}
            onSelect={setSelected}
            getItemKey={(item) => item.id}
            getItemDisplay={(item) => item.name}
        >
            <Dropdown.Trigger displayValue={selected?.name || ""} placeholder="Select..." />
            <Dropdown.Searchable />
        </Dropdown.Root>
    );
}
```

## Component Overview

### Core Components

| Component          | Purpose                   |
| ------------------ | ------------------------- |
| `Dropdown.Root`    | State management provider |
| `Dropdown.Trigger` | Button to toggle dropdown |
| `Dropdown.Content` | Animated container        |
| `Dropdown.Search`  | Filter input              |
| `Dropdown.List`    | Scrollable item list      |
| `Dropdown.Header`  | Fixed header section      |
| `Dropdown.Footer`  | Fixed footer section      |

### Pre-built Components

| Component             | Purpose                      |
| --------------------- | ---------------------------- |
| `Dropdown.Searchable` | Search input + list combined |
| `Dropdown.Simple`     | List only (no search)        |
| `Dropdown.Menu`       | Action menu variant          |

### Hooks

| Hook                    | Purpose                     |
| ----------------------- | --------------------------- |
| `useDropdownContext`    | Access dropdown state       |
| `useKeyboardNavigation` | Keyboard navigation helpers |
| `useClickOutside`       | Click outside detection     |

## Peer Dependencies

- `react` >= 18
- `react-dom` >= 18
- `motion` >= 12

## Links

- [GitHub Repository](https://github.com/OctavianTocan/react-dropdown)
- [npm Package](https://www.npmjs.com/package/@octavian-tocan/react-dropdown)
- [Storybook](https://octaviantocan.github.io/react-dropdown/)
