# Contributing Guide

Thank you for your interest in contributing to `@octavian-tocan/react-dropdown`. This guide will help you get started.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm (recommended) or npm

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/OctavianTocan/react-dropdown.git
cd react-dropdown

# Install dependencies
pnpm install

# Start development
pnpm dev
```

---

## Development Setup

### Install Dependencies

```bash
pnpm install
```

### Available Scripts

| Script                 | Description                           |
| ---------------------- | ------------------------------------- |
| `pnpm dev`             | Watch mode - rebuilds on file changes |
| `pnpm build`           | Production build                      |
| `pnpm typecheck`       | TypeScript type checking              |
| `pnpm test`            | Run tests once                        |
| `pnpm test:watch`      | Run tests in watch mode               |
| `pnpm test:coverage`   | Run tests with coverage report        |
| `pnpm lint`            | ESLint check                          |
| `pnpm storybook`       | Start Storybook dev server            |
| `pnpm build-storybook` | Build static Storybook                |
| `pnpm clean`           | Remove dist and coverage directories  |

### Running Storybook

Storybook is the primary development environment:

```bash
pnpm storybook
# Opens at http://localhost:6006
```

---

## Project Structure

```
react-dropdown/
├── src/
│   ├── index.ts                 # Barrel exports
│   ├── types.ts                 # TypeScript interfaces
│   ├── design-tokens.ts         # Design constants
│   │
│   ├── DropdownRoot.tsx         # State management provider
│   ├── DropdownContext.tsx      # Context + hooks
│   ├── DropdownTrigger.tsx      # Toggle button
│   ├── DropdownContent.tsx      # Animated container
│   ├── DropdownSearch.tsx       # Filter input
│   ├── DropdownList.tsx         # Item list
│   ├── DropdownHeader.tsx       # Fixed header
│   ├── DropdownFooter.tsx       # Fixed footer
│   │
│   ├── DropdownSearchable.tsx   # Pre-built: Search + List
│   ├── DropdownSimple.tsx       # Pre-built: List only
│   ├── DropdownMenu.tsx         # Pre-built: Action menu
│   │
│   ├── __tests__/               # Test files
│   ├── __stories__/             # Storybook stories
│   └── test-utils/              # Test helpers
│
├── docs/                        # Documentation
├── dist/                        # Build output (gitignored)
├── coverage/                    # Test coverage (gitignored)
│
├── package.json
├── tsconfig.json
├── tsup.config.ts               # Build configuration
├── vitest.config.ts             # Test configuration
└── README.md
```

---

## Development Workflow

### Creating a New Component

1. **Create the component file** in `src/`:

```tsx
// src/DropdownNewComponent.tsx
"use client";

import { useDropdownContext } from "./DropdownContext";
import type { BaseDropdownProps } from "./types";

export interface DropdownNewComponentProps extends BaseDropdownProps {
    // Add specific props
}

export function DropdownNewComponent({
    className = "",
    children,
    "data-testid": testId = "dropdown-new-component",
}: DropdownNewComponentProps) {
    const context = useDropdownContext();

    return (
        <div className={className} data-testid={testId}>
            {children}
        </div>
    );
}
```

2. **Add types** to `types.ts` if needed

3. **Export from index.ts**:

```tsx
export { DropdownNewComponent } from "./DropdownNewComponent";
export type { DropdownNewComponentProps } from "./DropdownNewComponent";

// Add to compound component
const Dropdown = {
    // ...existing
    NewComponent: DropdownNewComponent,
};
```

4. **Add tests** in `__tests__/`:

```tsx
// src/__tests__/DropdownNewComponent.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DropdownNewComponent } from "../DropdownNewComponent";
import { renderDropdown } from "../test-utils/test-helpers";

describe("DropdownNewComponent", () => {
    it("renders children", () => {
        renderDropdown(
            <DropdownNewComponent>
                <span>Content</span>
            </DropdownNewComponent>
        );

        expect(screen.getByText("Content")).toBeInTheDocument();
    });
});
```

5. **Add stories** in `__stories__/`:

```tsx
// src/__stories__/DropdownNewComponent.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { DropdownNewComponent } from "../DropdownNewComponent";
import Dropdown from "../index";

const meta: Meta<typeof DropdownNewComponent> = {
    title: "Components/DropdownNewComponent",
    component: DropdownNewComponent,
};

export default meta;
type Story = StoryObj<typeof DropdownNewComponent>;

export const Default: Story = {
    render: () => (
        <Dropdown.Root items={[]} onSelect={() => {}} getItemKey={() => ""} getItemDisplay={() => ""}>
            <DropdownNewComponent>Content</DropdownNewComponent>
        </Dropdown.Root>
    ),
};
```

### Modifying Existing Components

1. Make your changes
2. Update tests if behavior changed
3. Update stories if UI changed
4. Update types if API changed
5. Run full test suite: `pnpm test`
6. Check types: `pnpm typecheck`

---

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Watch mode (re-runs on file changes)
pnpm test:watch

# With coverage
pnpm test:coverage
```

### Test Structure

Tests use Vitest + React Testing Library:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("Component", () => {
    it("should do something", async () => {
        const user = userEvent.setup();
        render(<Component />);

        await user.click(screen.getByRole("button"));

        expect(screen.getByText("Result")).toBeInTheDocument();
    });
});
```

### Test Helpers

Use the provided test utilities:

```tsx
import { renderDropdown, createMockDropdownContext } from "../test-utils/test-helpers";
import { mockItems } from "../test-utils/mock-data";

// Render component within dropdown context
renderDropdown(<DropdownList {...props} />);

// Create mock context
const mockContext = createMockDropdownContext({
    isOpen: true,
    items: mockItems,
});
```

### Coverage Requirements

Aim for high coverage on:

- Core functionality
- Edge cases
- User interactions
- Accessibility features

---

## Code Style

### TypeScript

- Use strict TypeScript
- Export all types
- Use generics for item types
- Document complex types with JSDoc

```tsx
/**
 * @brief Props for the dropdown component
 */
export interface DropdownProps<T> {
    /** Array of items to display */
    items: T[];
    /** Callback when item is selected */
    onSelect: (item: T) => void;
}
```

### React

- Use functional components
- Prefer hooks over class components
- Use `'use client'` directive for client components
- Memoize expensive computations with `useMemo`
- Use `useCallback` for stable function references

### Styling

- Use Tailwind CSS classes
- Support custom `className` prop
- Keep default styles minimal
- Use design tokens for consistency

### Naming Conventions

- **Components**: PascalCase (`DropdownList.tsx`)
- **Files**: Match component name
- **Types**: PascalCase with Props/Meta suffix
- **Hooks**: camelCase with `use` prefix
- **Test files**: `*.test.tsx`
- **Story files**: `*.stories.tsx`

---

## Pull Request Process

### Before Submitting

1. **Ensure tests pass**:

    ```bash
    pnpm test
    ```

2. **Check types**:

    ```bash
    pnpm typecheck
    ```

3. **Run linter**:

    ```bash
    pnpm lint
    ```

4. **Test build**:

    ```bash
    pnpm build
    ```

5. **Update documentation** if needed

### PR Guidelines

- Use descriptive PR titles following conventional commits:
    - `feat: add new dropdown variant`
    - `fix: resolve keyboard navigation bug`
    - `docs: update API reference`
    - `refactor: simplify state management`
    - `test: add missing test cases`
    - `chore: update dependencies`

- Include a clear description of:
    - What changed
    - Why it changed
    - How to test it

- Link related issues

### Review Process

1. Submit PR against `main` branch
2. Automated checks run (tests, types, lint)
3. Request review from maintainers
4. Address feedback
5. Squash and merge when approved

---

## Release Process

Releases are automated via GitHub Actions and semantic-release.

### Commit Message Format

Follows [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

| Type              | Version Bump | Description      |
| ----------------- | ------------ | ---------------- |
| `fix`             | Patch        | Bug fixes        |
| `feat`            | Minor        | New features     |
| `BREAKING CHANGE` | Major        | Breaking changes |
| `docs`            | None         | Documentation    |
| `refactor`        | None         | Code refactoring |
| `test`            | None         | Test changes     |
| `chore`           | None         | Maintenance      |

### Version Bumps

- `fix: ...` → `1.0.0` → `1.0.1`
- `feat: ...` → `1.0.0` → `1.1.0`
- `feat!: ...` or `BREAKING CHANGE` → `1.0.0` → `2.0.0`

### Release Workflow

1. Merge PR to `main`
2. GitHub Actions runs:
    - Tests
    - Build
    - semantic-release
3. If release triggered:
    - Version bumped
    - CHANGELOG updated
    - npm package published
    - GitHub release created

---

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Join discussions in the repository

Thank you for contributing!
