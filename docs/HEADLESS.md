# Headless API — `useDropdown`

`useDropdown` is a **headless hook** that returns prop getters for the
trigger, content panel, and items of a dropdown. It owns the open/close
state, the keyboard navigator (type-ahead, arrow keys, Home/End,
Enter/Escape), focus tracking, click-outside, and ARIA wiring. It does
**not** render anything — the consumer owns the markup, styling, motion,
and portal strategy.

The hook ships alongside the existing component-driven API
(`Dropdown.Root`, `Dropdown.Trigger`, `Dropdown.Content`,
`Dropdown.Menu`, etc.). Both APIs coexist; pick whichever fits the call
site.

## When to use which

| Use the hook (`useDropdown`)                                  | Use the components (`Dropdown.*` / `DropdownMenu`)               |
| ------------------------------------------------------------- | ---------------------------------------------------------------- |
| You need a custom shell — your own portal, your own animation | You want batteries-included motion, portal, collision handling   |
| Your trigger is a non-standard element (a row, an icon stack) | Your trigger is a single `<button>` you can wrap with `asChild`  |
| You're embedding the dropdown inside another widget           | The dropdown is a top-level menu                                 |
| You need different styling per row beyond what `renderItem` allows | Your rows are uniform and `renderItem` covers the variations  |
| You're building a discoverable / context-menu surface         | You're building a standard click-to-open action menu             |

If you're not sure, start with the components — they're shorter to write
and cover ~90 % of cases. Switch to the hook the first time you find
yourself fighting the component API.

## Quick start

```tsx
import { useRef } from "react";
import { useDropdown } from "@octavian-tocan/react-dropdown";

interface User {
  id: string;
  name: string;
  inactive?: boolean;
}

const USERS: readonly User[] = [
  { id: "alice", name: "Alice" },
  { id: "bob", name: "Bob", inactive: true },
  { id: "carol", name: "Carol" },
];

export function UserPicker(): React.JSX.Element {
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const dropdown = useDropdown<User>({
    items: USERS,
    getItemLabel: (u) => u.name,
    getItemDisabled: (u) => Boolean(u.inactive),
    onOpenChange: (open) => console.log("open?", open),
  });

  return (
    <>
      <button
        type="button"
        className="rounded px-3 py-1"
        {...dropdown.getTriggerProps({ ref: triggerRef })}
      >
        {dropdown.isOpen ? "Close" : "Pick a user"}
      </button>

      {dropdown.isOpen && (
        <ul
          className="popover-styled mt-1 min-w-40 p-1"
          {...dropdown.getContentProps()}
        >
          {USERS.map((user, i) => (
            <li
              key={user.id}
              className="rounded px-2 py-1.5 data-[focused=true]:bg-foreground/10 data-[disabled=true]:opacity-50"
              {...dropdown.getItemProps({
                index: i,
                onSelect: () => console.log("picked", user),
              })}
            >
              {user.name}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
```

That's the entire surface — there's no provider, no context, no portal
helper. The hook is one render away from a working dropdown.

## API

### `useDropdown<T>(options)`

| Option            | Type                                       | Default       | Notes                                                                 |
| ----------------- | ------------------------------------------ | ------------- | --------------------------------------------------------------------- |
| `items`           | `readonly T[]`                             | required      | Items the menu navigates through. Must be stable across renders.       |
| `getItemLabel`    | `(item: T) => string`                      | `String(item)`| Text used by type-ahead. Falls back to `String()` when omitted.       |
| `getItemDisabled` | `(item: T) => boolean`                     | `() => false` | Disabled items are skipped on traversal and ignore clicks.            |
| `defaultOpen`     | `boolean`                                  | `false`       | Initial open state.                                                    |
| `onOpenChange`    | `(open: boolean) => void`                  | —             | Fires once per transition (open → close, close → open).                |
| `closeOnSelect`   | `boolean`                                  | `true`        | Set to `false` for multi-select pickers.                               |
| `idPrefix`        | `string`                                   | auto-generated| Pin the id prefix when you need SSR-stable markup.                    |

Returns a {@link UseDropdownReturn} object with state, imperative
controls, and prop getters.

### `getTriggerProps(userProps?)`

Spread onto the consumer's trigger element. The hook attaches:

- `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`
- `onClick` → toggles open
- `onKeyDown` → opens on `ArrowDown` / `ArrowUp` / `Enter` / `Space`
- `ref` (composed with the optional consumer ref) so click-outside
  detection knows where the trigger is

Consumer event handlers passed via `userProps` run **before** the hook's
handler. Calling `event.preventDefault()` from a consumer handler skips
the hook's default behavior (Radix-style merge contract).

### `getContentProps(userProps?)`

Spread onto the panel element (a `<ul>`, `<div role="menu">`, or
similar). The hook attaches:

- `role="menu"`, stable `id`, `tabIndex={-1}`
- `aria-activedescendant` pointing at the focused item's id
- `onKeyDown` → arrow keys, Home/End, Enter (activate), Space (activate),
  Escape (close), and alphanumeric type-ahead
- `ref` composed with the optional consumer ref

The consumer is responsible for portaling, animating, and styling the
panel. The hook contributes only behavior.

### `getItemProps({ index, onSelect, disabled?, ...userProps })`

Spread onto each row. The hook attaches:

- `role="menuitem"`, deterministic `id` (`${idPrefix}-item-${index}`)
- `data-focused="true"` when this row is the active descendant — style
  with `data-[focused=true]:bg-foreground/10` or similar
- `data-disabled="true"` + `aria-disabled` when the row is disabled
  (either the global `getItemDisabled` accessor or the per-call
  `disabled` override)
- `onClick` → calls `onSelect`, then closes if `closeOnSelect` is true
- `onMouseEnter` → moves the focused index to this row, keeping
  pointer focus and keyboard focus in sync (the typical menu UX)

Keyboard activation (Enter / Space) on the focused item synthesizes a
`click()` on the matching DOM element, which routes through the same
`onClick` handler. This means the consumer registers selection logic
once per row instead of in two parallel places.

### Imperative API

```ts
const { isOpen, open, close, toggle, focusedIndex, setFocusedIndex } = useDropdown(...);
```

- `open()` / `close()` are idempotent — duplicate calls fire
  `onOpenChange` only on the actual transition.
- `setFocusedIndex(index)` lets you sync the active descendant from
  outside (e.g. on scroll-into-view or autofocus on a custom event).

## Composing with portals

The hook intentionally doesn't portal the content — that's a styling /
positioning decision and there's no one-size-fits-all answer. To portal
into `document.body`:

```tsx
import { createPortal } from "react-dom";
import { useDropdown } from "@octavian-tocan/react-dropdown";

function PortaledMenu() {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dropdown = useDropdown({ items: ITEMS });

  // Compute position from triggerRef's bounding rect — the same math
  // DropdownContent already does internally for the component API.
  const position = triggerRef.current?.getBoundingClientRect();

  return (
    <>
      <button {...dropdown.getTriggerProps({ ref: triggerRef })}>Open</button>
      {dropdown.isOpen &&
        createPortal(
          <ul
            style={{
              position: "fixed",
              top: position ? position.bottom + 4 : 0,
              left: position?.left ?? 0,
            }}
            {...dropdown.getContentProps()}
          >
            {/* items */}
          </ul>,
          document.body,
        )}
    </>
  );
}
```

## Composing with motion

The hook keeps `isOpen` in sync the moment a transition fires. Wrap the
content with your motion library of choice (Motion / Framer, react-spring,
view-transition-name, plain CSS keyframes) and key it off `isOpen`:

```tsx
<AnimatePresence>
  {dropdown.isOpen && (
    <motion.ul
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
      {...dropdown.getContentProps()}
    >
      {/* items */}
    </motion.ul>
  )}
</AnimatePresence>
```

`AnimatePresence`'s exit animation runs on the JSX element being
unmounted — when `isOpen` flips to `false`, the hook's content ref clears
and the click-outside listener detaches in the same tick.

## Ref composition

`getTriggerProps({ ref })` and `getContentProps({ ref })` accept a
single consumer ref (object or callback) and compose it with the hook's
internal ref via `composeRefs`. The internal ref is used for
click-outside hit-testing, so consumers should always pass their own
ref through this argument rather than attaching it directly to the
element — otherwise the hook can't see the element.

```tsx
// Right — hook composes both refs.
const userRef = useRef<HTMLButtonElement | null>(null);
<button {...dropdown.getTriggerProps({ ref: userRef })}>Open</button>;

// Wrong — hook never sees the trigger.
const userRef = useRef<HTMLButtonElement | null>(null);
<button ref={userRef} {...dropdown.getTriggerProps()}>Open</button>;
```

## Keyboard model

Reuses the package's `useMenuKeyboard` hook. Behavior matches Radix's
`DropdownMenu`:

- **ArrowDown / ArrowUp** — move focus to the next/previous enabled
  item, wrapping at the ends.
- **Home / End** — jump to the first / last enabled item.
- **Enter / Space** — activate the focused item (synthesizes a click
  on the matching DOM element).
- **Escape** — close the menu.
- **Alphanumeric** — append to a 500 ms type-ahead buffer and jump
  focus to the first item whose label starts with the buffer
  (case-insensitive).

When the menu opens, focus auto-lands on the first enabled item so
keyboard users see a live cursor without first pressing arrow-down.

## Caveats and limitations

- The hook does not implement nested submenus. Use `DropdownSubmenu` /
  `DropdownSubmenuTrigger` / `DropdownSubmenuContent` from the
  component API if you need flyout sub-menus.
- The hook does not control focus-on-open (it doesn't move keyboard
  focus to the content panel; the consumer should call
  `contentRef.current?.focus()` manually if their UX needs it). The
  reasoning: many headless consumers want the trigger to keep keyboard
  focus while the menu is open (so the trigger's own keyboard handlers
  still fire).
- The hook listens for a `pointerdown` outside the trigger and content
  refs. If your trigger is rendered inside an overlay / portal that
  intercepts pointer events (an open Modal, for example), make sure
  the trigger ref points at the actual interactive element, not its
  wrapper.
- Per-item disabled state is computed each call to `getItemProps`. If
  the disabled accessor is expensive, memoize the items array upstream
  or set `disabled` directly on the call.
- **Keyboard activation uses `document.getElementById`.** When the user
  presses Enter or Space on the focused item, the hook synthesizes a
  click on the matching DOM element looked up by its deterministic id
  (`${idPrefix}-item-${index}`). This fails silently for items that are
  not currently in the DOM — virtualized lists, portals that haven't
  mounted yet, off-tree rendering. If you hit this, intercept activation
  in your own `onKeyDown` on the content (forward via
  `getContentProps({ onKeyDown })`) and call your `onSelect` directly
  using the current `focusedIndex`.
