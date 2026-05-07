# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (panel-mode JSX surface)

- **`DropdownPanelMenu`** — sibling to the data-driven `DropdownMenu` that
  accepts arbitrary JSX children instead of `items + renderItem`. Compose
  any tree of `DropdownMenuItem` / `DropdownMenuLabel` / `DropdownMenuSeparator`
  / `DropdownMenuShortcut` directly. Internally wraps `DropdownRoot` with a
  no-op data path; the items dispatch via `useDropdownContext().closeDropdown`,
  so close-on-select works without the data path. Reuses the same
  `DropdownContent` motion variants for visual continuity.
- **`DropdownMenuItem`** (JSX) — Radix-`DropdownMenu.Item`-shaped clickable row
  with `onSelect({ preventDefault })`, `asChild` (for wrapping around `<a href>`
  etc.), `inset`, `variant: 'default' | 'destructive'`, `disabled`. Calls
  `closeDropdown()` on activation unless `event.preventDefault()` is called.
  Activates via click, Enter, or Space.
- **`DropdownMenuSeparator`**, **`DropdownMenuLabel`** (with `inset`),
  **`DropdownMenuShortcut`** — supporting JSX primitives matching Radix's
  surface so existing menu compositions migrate one-to-one.

### Added (right-click context menu)

- **`DropdownContextMenu`** family — three components (`DropdownContextMenu`,
  `DropdownContextMenuTrigger`, `DropdownContextMenuContent`) that open the
  same panel-mode UI on `oncontextmenu`. The trigger captures the right-click,
  prevents the browser's native menu, and stores `clientX`/`clientY` so a
  hidden 1×1 fixed-position anchor reuses `DropdownContent`'s existing
  collision-flip + portal positioning to land the panel at the cursor. The
  same `DropdownMenuItem` / Label / Separator JSX primitives work inside
  without modification, which lets `frontend/components/ui/menu-context.tsx`
  route the same item tree into either the panel or the context menu.
- Trigger supports `asChild` so existing rows (e.g. `EntityRow`'s clickable
  `div role="button"`) can host the right-click handler without an extra DOM
  level.
- Closing dismissals (click-outside, Escape, item activation) propagate via
  `onOpenChange(false)`; opens publish `onOpenChange(true)`.

### Tested

- 8 new tests for `DropdownPanelMenu` (open/close, onSelect, preventDefault,
  disabled, asChild, separator/label/shortcut, Enter activation).
- 7 new tests for `DropdownContextMenu` (right-click open, native-menu
  prevention, item click, click-outside, asChild trigger, disabled trigger,
  onOpenChange).
- Total: 167 tests passing (152 → 167).

### Added (headless API)

- **`useDropdown` headless hook** — prop-getter API in the Headless UI /
  Downshift / Reach style. Returns `{ isOpen, open, close, toggle,
  focusedIndex, setFocusedIndex, getTriggerProps, getContentProps,
  getItemProps, contentId }`. Each prop getter accepts an optional
  `userProps` argument; consumer event handlers run BEFORE the hook's
  handler and can opt out of the default behavior via
  `event.preventDefault()` (Radix-style merge contract). Composes
  consumer refs with the hook's internal trigger/content refs so
  click-outside detection still works when the consumer holds the ref.
  Shares the existing `useMenuKeyboard` for type-ahead, arrow keys,
  Home/End, Enter (activate), Space (activate), and Escape (close).
  Keyboard activation synthesizes a `click()` on the matching DOM
  element so per-row `onSelect` handlers stay the single source of
  truth. Additive — does NOT refactor the existing component-driven
  `DropdownRoot` / `DropdownContent` / `DropdownTrigger`. Unifying the
  two APIs onto a single internal hook is deferred to a follow-up to
  avoid regressing the existing 130-test suite. Ships with 22 unit
  tests and a new [`docs/HEADLESS.md`](./docs/HEADLESS.md) guide.
  `README.md` now advertises both APIs side-by-side.

### Changed (motion overhaul)

- **Linear-snappy motion defaults.** `enterDuration` 0.2 → **0.14** (140 ms),
  `exitDuration` 0.15 → **0.10** (100 ms). Close is now meaningfully faster
  than open, matching the Linear / Vercel / Arc overlay vocabulary.
- **`exitEase` defaults to `[0.7, 0, 0.84, 0]`** (ease-in-quint) independently
  of `enterEase` (which stays at `[0.16, 1, 0.3, 1]`, ease-out-expo). The
  exit motion accelerates as it leaves rather than easing out symmetrically
  — reads as "getting out of the way" rather than gently fading.
- **`filter: blur(8px)` on enter/exit.** Motion variants now animate a blur
  alongside opacity, scale, and y. Element starts blurry and out-of-place,
  focuses into clarity (Linear / Vercel / Arc pattern). Reduced-motion path
  strips the blur (and the scale + y) for users with the OS preference set.
- **Globalized backdrop blur on `popover-styled`** (consumer-side change in
  the parent app's `globals.css`). The base `.popover-styled` utility now
  applies `backdrop-filter: blur(8px)` and an 88% background tint, so every
  dropdown / popover / context menu reads as frosted glass by default.
  Scenic mode continues to bump the blur to 24 px. Requires modern browsers
  with `color-mix()` and `backdrop-filter` support.

### Fixed

- **`getItemSeparator` now renders the divider ABOVE the marked item**, matching
  the prop's existing docstring. Earlier versions emitted the divider AFTER
  the item, which made the typical "draw a line above the advanced section"
  use case feel inverted (the consumer marked the last item and the line fell
  below it). The renderer also suppresses the divider when it would land at
  the very top of the list or the top of a section.
- **Open/close state propagates synchronously.** `DropdownRoot.openDropdown`
  and `DropdownRoot.closeDropdown` now flip `isOpen` and fire `onOpenChange`
  in the same tick as the user gesture. Earlier versions deferred the close
  by `exitDuration * 1000` ms while the visible motion did nothing, which
  forced consumer guards (e.g. tooltip suppression) to compensate for the
  timing skew and produced ~300 ms of "frozen" feeling before any pixel
  changed.
- **`enterDuration` and `exitDuration` now drive their respective motions
  independently.** `DropdownContent` previously routed both directions
  through a single `transition.duration` keyed to `enterDuration`, so
  `exitDuration` was effectively ignored at the motion layer. Per-variant
  transitions on `animate` and `exit` honor each prop on its own timeline.
- **Separator color tokens through Tailwind theme.** Dividers in the list
  now use `bg-border` instead of hardcoded `border-gray-200`, so they adapt
  to dark mode and design-system overrides.
- **Portal positioning runs in `useLayoutEffect`** instead of `useEffect`,
  eliminating the one-frame flash at `top: 0 / right: 0` when the dropdown
  first mounts in portal mode.

### Changed

- **`AnimatePresence` drives exit animation directly off `isOpen`** — removed
  the internal `shouldRender` double-buffer in `DropdownContent` that was
  layering on top of `AnimatePresence`'s own exit handling. Net effect: a
  ~500 ms close (300 ms dead time + 200 ms fade) becomes a ~150 ms close
  that starts immediately on click.
- **`closeImmediate` is now an alias of `closeDropdown`.** The previous
  "skip exit animation" path relied on a `skipExitAnimationRef` that the
  refactor no longer needs; pass `disableAnimation` to `DropdownContent`
  (or set `exitDuration={0}`) when an instant teardown is required.
  `closeImmediate` is kept in context for backward compatibility.

### Added

- **Flyout sub-menus** (`DropdownSubmenu` / `DropdownSubmenuTrigger` /
  `DropdownSubmenuContent`) — Radix `DropdownMenuSub` parity. Trigger opens
  on click, Enter/Space, ArrowRight, or after a 100 ms hover delay; closes
  after a 200 ms grace delay on pointer-leave (cancelled if the cursor enters
  the panel). ArrowLeft / Escape from inside the panel close it and restore
  focus to the trigger. Side-flip collision detection (right ↔ left) when
  one side overflows the viewport. Motion variants reuse the root's
  `enterDuration` / `exitDuration` / `enterEase` / `exitEase` for visual
  continuity with the parent menu (filter blur, scale + x offset on enter/
  exit). Each `DropdownSubmenu` creates its own context, so nesting works to
  arbitrary depth — chains close from outermost-in on root close.
  Limitations: no safe-triangle hover diagonal yet (uses a simple 200 ms
  grace window); no auto-focus-first-item when opened via keyboard.
- **`asChild` prop** on `DropdownMenu` and `DropdownMenuDef`. When true, the
  consumer's trigger element becomes the actual focusable element via the
  new bundled `Slot` primitive (no wrapping `<div>`). Inline-flex layouts
  and ARIA semantics on the consumer's `<Button>` are preserved. The
  exported `Slot` (with composed refs, event handlers via slot-first /
  child-after-unless-prevented composition, and className concatenation)
  is also available for custom compositions. Adds zero new external
  dependencies.
- **`align` and `alignOffset` props** on `DropdownRoot`. `align` accepts
  `'start' | 'center' | 'end'` (default `'end'` matches the historical
  right-edge anchor). `alignOffset` is a pixel offset added to the chosen
  alignment edge. Portal positioning math switches anchor sides cleanly
  (the unused side is `null` so `top`/`bottom` and `left`/`right` don't
  conflict in inline `style`).
- **Continuous viewport repositioning while open.** `DropdownContent` adds a
  `window resize` + capture-phase `window scroll` listener while the
  dropdown is open, throttled via `requestAnimationFrame`. Re-runs the
  align + collision-flip math when the trigger's position moves under
  ancestor scroll or viewport resize. Cleans up listeners + cancels rAF
  on close / unmount.
- **Roving keyboard navigation in `DropdownMenu`**. Action menus now ship the
  full Radix-equivalent surface out of the box: ArrowDown / ArrowUp move focus
  between enabled items (with wrap), Home / End jump to first / last, Enter or
  Space activate the focused item, Escape closes, and any alphanumeric key
  drives type-ahead — a 500 ms buffer that jumps focus to the first item whose
  display starts with the typed prefix. Disabled items are skipped on every
  traversal. Implemented via the new `useMenuKeyboard` hook (also exported for
  custom compositions) and an internal `MenuKeyboardSurface` wrapper that
  takes focus, runs the hook, and reports the active descendant via
  `aria-activedescendant`. `<li>` rows expose `id` (so the ARIA reference
  resolves) and `data-focused="true"` (so consumers can style the active row
  in their own `renderItem` markup).
- **`enterEase` / `exitEase` props** on `DropdownRoot` for per-direction motion
  curves. Both default to `[0.16, 1, 0.3, 1]` (gentle ease-out-expo).
- **`anchorRef` prop** on `DropdownRoot` — separate from `triggerRef` so the
  visual anchor can differ from the click target (e.g. a hidden hotkey trigger
  anchored to a visible toolbar). Falls back to `triggerRef` when unset.
- **`onOpenAutoFocus` / `onCloseAutoFocus`** lifecycle callbacks on
  `DropdownRoot`, mirroring Radix's API. Called with a preventable event just
  before the dropdown's default focus behavior runs (focus first item on open;
  restore to trigger on close). Calling `event.preventDefault()` lets consumers
  route focus elsewhere — useful for form integrations and command palettes.
- **`respectReducedMotion` prop** on `DropdownRoot` (default `true`). Honors
  the user's OS-level `prefers-reduced-motion` setting via Motion's
  `useReducedMotion` hook by collapsing scale/y motion to an opacity-only
  fade. Pass `false` to force the full motion regardless of OS preference.
- **`collisionDetection` prop** on `DropdownRoot` (default `true`). For
  explicit `top` / `bottom` placements, the dropdown measures itself against
  the viewport on open and flips to the opposite side when the requested side
  would overflow. A `ResizeObserver` re-evaluates the flip when content
  resizes mid-open (e.g. async data load). The resolved side is exposed via
  `data-placement` on the content motion.div.
- **`getItemSeparator` examples** added to `DropdownRootProps`, `DropdownListProps`,
  and the runtime context with a clear description of the "above" semantics.
- **`MenuItemDef` 'submenu' supports arbitrary depth.** `DropdownMenuDef`'s
  inline-accordion submenus previously rendered nested submenus past the first
  level as plain labels; they now render recursively, each `SubmenuRow`
  managing its own accordion state for its direct children so a 4-level menu
  toggles cleanly without level-1 state colliding with level-3 state.
- **CSS variable indirection on `ELEVATED_SHADOW`.** The shadow now resolves
  via `var(--dropdown-shadow, <fallback>)`, so consumers can override the
  surface elevation per app or per region without overriding `contentClassName`.
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
