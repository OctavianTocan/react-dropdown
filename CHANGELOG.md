# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
