# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Sub-path exports for types (`/types`) and hooks (`/hooks`) for better tree-shaking
- Optional default CSS styles (`/styles.css`) with CSS custom properties
- Enhanced JSDoc documentation with `@example` tags
- Improved error messages with usage examples and documentation links

## [1.1.0] - 2026-02-02

### Added

- `placement="auto"` option for automatic dropdown placement based on viewport position
- `DropdownHeader` and `DropdownFooter` components for custom header/footer content
- `offset` prop to control distance between trigger and dropdown content
- `enterDuration` and `exitDuration` props for animation timing control
- `getItemSeparator` prop for adding visual separators between items
- `getItemDisabled` prop for disabling individual items
- `getItemClassName` prop for custom item styling

### Changed

- Renamed `dropdownPlacement` to `placement` (old prop deprecated but still works)

### Deprecated

- `dropdownPlacement` prop - use `placement` instead

## [1.0.0] - 2026-02-01

### Added

- Initial release of `@octavian-tocan/react-dropdown`
- Composable dropdown component system with compound component pattern
- Pre-made components: `Dropdown.Simple`, `Dropdown.Searchable`, `Dropdown.Menu`
- Core components: `Dropdown.Root`, `Dropdown.Trigger`, `Dropdown.Content`, `Dropdown.Search`, `Dropdown.List`
- Support for search/filter functionality
- Support for icons, descriptions, and grouped sections
- Portal rendering support to avoid overflow clipping
- Top/bottom placement control
- Keyboard navigation (Arrow keys, Enter, Escape)
- Click-outside detection
- TypeScript support with full type safety
- Comprehensive Storybook stories
- Vitest test suite
- Accessible by default with proper ARIA attributes
- Uses Motion (latest version of Framer Motion) for animations
- Pure React implementation (no React Native dependencies)

---

## Migration Guide

### Upgrading to 1.1.0

#### Placement Prop Rename

The `dropdownPlacement` prop has been renamed to `placement`. The old prop still works but is deprecated:

```tsx
// Before (deprecated)
<Dropdown.Root dropdownPlacement="top" ... />

// After (recommended)
<Dropdown.Root placement="top" ... />
```

### Future Breaking Changes

When upgrading to future major versions, check this section for migration guidance.
