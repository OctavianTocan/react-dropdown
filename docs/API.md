# API Reference

Complete API documentation for `@octavian-tocan/react-dropdown`.

## Table of Contents

- [Components](#components)
    - [DropdownRoot](#dropdownroot)
    - [DropdownTrigger](#dropdowntrigger)
    - [DropdownContent](#dropdowncontent)
    - [DropdownSearch](#dropdownsearch)
    - [DropdownList](#dropdownlist)
    - [DropdownHeader](#dropdownheader)
    - [DropdownFooter](#dropdownfooter)
    - [DropdownSearchable](#dropdownsearchable)
    - [DropdownSimple](#dropdownsimple)
    - [DropdownMenu](#dropdownmenu)
- [Hooks](#hooks)
    - [useDropdownContext](#usedropdowncontext)
    - [useKeyboardNavigation](#usekeyboardnavigation)
    - [useClickOutside](#useclickoutside)
- [Types](#types)

---

## Components

### DropdownRoot

The root provider component that manages all dropdown state. All other dropdown components must be descendants of this component.

```tsx
import { DropdownRoot } from "@octavian-tocan/react-dropdown";
// or
import Dropdown from "@octavian-tocan/react-dropdown";
// Use as: <Dropdown.Root>
```

#### Props

| Prop                 | Type                                                            | Default           | Description                                    |
| -------------------- | --------------------------------------------------------------- | ----------------- | ---------------------------------------------- |
| `items`              | `T[]`                                                           | **Required**      | Array of items to display in the dropdown      |
| `selectedItem`       | `T \| null`                                                     | `null`            | Currently selected item                        |
| `onSelect`           | `(item: T) => void`                                             | **Required**      | Callback invoked when an item is selected      |
| `getItemKey`         | `(item: T) => string`                                           | **Required**      | Function to get a unique key for each item     |
| `getItemDisplay`     | `(item: T) => string`                                           | **Required**      | Function to get display text for each item     |
| `filterItems`        | `(items: T[], query: string) => T[]`                            | Built-in          | Custom filter function for search              |
| `disabled`           | `boolean`                                                       | `false`           | Whether the dropdown is disabled               |
| `placeholder`        | `string`                                                        | -                 | Placeholder text for the trigger               |
| `placement`          | `'bottom' \| 'top' \| 'auto'`                                   | `'bottom'`        | Dropdown placement relative to trigger         |
| `offset`             | `number`                                                        | `8`               | Distance in pixels between trigger and content |
| `closeOnSelect`      | `boolean`                                                       | `true`            | Whether to close dropdown on selection         |
| `onOpenChange`       | `(isOpen: boolean) => void`                                     | -                 | Callback when open state changes               |
| `usePortal`          | `boolean`                                                       | `false`           | Render dropdown in a portal                    |
| `triggerRef`         | `RefObject<HTMLElement>`                                        | -                 | Ref to trigger element (required for portal)   |
| `enterDuration`      | `number`                                                        | `0.2`             | Enter animation duration in seconds            |
| `exitDuration`       | `number`                                                        | `0.15`            | Exit animation duration in seconds             |
| `enterEase`          | `[number, number, number, number]`                              | `[0.16,1,0.3,1]`  | Cubic-bezier easing curve for the enter motion |
| `exitEase`           | `[number, number, number, number]`                              | `enterEase`       | Cubic-bezier easing curve for the exit motion  |
| `respectReducedMotion` | `boolean`                                                     | `true`            | Honor `prefers-reduced-motion`; collapse scale/y to opacity-only fade |
| `collisionDetection` | `boolean`                                                       | `true`            | Flip explicit `top` / `bottom` placements that would overflow the viewport |
| `anchorRef`          | `RefObject<HTMLElement>`                                        | -                 | Visual anchor for positioning, distinct from `triggerRef` (the click target) |
| `onOpenAutoFocus`    | `(event: { preventDefault: () => void }) => void`               | -                 | Called before focus moves into the content on open; preventDefault to opt out |
| `onCloseAutoFocus`   | `(event: { preventDefault: () => void }) => void`               | -                 | Called before focus is restored to the trigger on close; preventDefault to route focus elsewhere |
| `getItemDescription` | `(item: T) => string \| null`                                   | -                 | Get description text for items                 |
| `getItemIcon`        | `(item: T) => ReactNode`                                        | -                 | Get icon element for items                     |
| `getItemSection`     | `(item: T) => DropdownSectionMeta \| null`                      | -                 | Group items into sections                      |
| `getItemSeparator`   | `(item: T, index: number) => boolean`                           | -                 | Render divider ABOVE this item (suppressed at the top of the list) |
| `getItemDisabled`    | `(item: T) => boolean`                                          | -                 | Determine if item is disabled                  |
| `getItemClassName`   | `(item: T, isSelected: boolean, isDisabled: boolean) => string` | -                 | Custom className for items                     |
| `className`          | `string`                                                        | `''`              | Additional CSS class for root container        |
| `data-testid`        | `string`                                                        | `'dropdown-root'` | Test identifier                                |

#### Example

```tsx
<DropdownRoot
    items={users}
    selectedItem={selectedUser}
    onSelect={setSelectedUser}
    getItemKey={(user) => user.id}
    getItemDisplay={(user) => user.name}
    getItemDescription={(user) => user.email}
    getItemIcon={(user) => <Avatar src={user.avatar} />}
    placement="auto"
>
    <DropdownTrigger
        displayValue={selectedUser?.name || ""}
        placeholder="Select user"
    />
    <DropdownSearchable />
</DropdownRoot>
```

---

### DropdownTrigger

Button component that toggles the dropdown open/closed state.

#### Props

| Prop           | Type        | Default      | Description                        |
| -------------- | ----------- | ------------ | ---------------------------------- |
| `displayValue` | `string`    | **Required** | Text to display in the trigger     |
| `placeholder`  | `string`    | -            | Placeholder when no value selected |
| `className`    | `string`    | -            | Additional CSS class               |
| `children`     | `ReactNode` | -            | Custom trigger content             |

#### Example

```tsx
<DropdownTrigger
    displayValue={selected?.name || ""}
    placeholder="Choose an option..."
/>
```

---

### DropdownContent

Container component with animation support. Wraps list and other content.

#### Props

| Prop                | Type        | Default         | Description                   |
| ------------------- | ----------- | --------------- | ----------------------------- |
| `disableAnimation`  | `boolean`   | `false`         | Disable enter/exit animations |
| `portal`            | `boolean`   | `false`         | Render in a portal            |
| `portalContainer`   | `Element`   | `document.body` | Portal target element         |
| `backdrop`          | `boolean`   | `false`         | Show backdrop behind dropdown |
| `backdropClassName` | `string`    | -               | Custom backdrop className     |
| `className`         | `string`    | -               | Additional CSS class          |
| `children`          | `ReactNode` | -               | Content to render             |

#### Example

```tsx
<DropdownContent className="min-w-[200px] bg-white rounded-lg shadow-lg">
    <DropdownHeader>Select Option</DropdownHeader>
    <DropdownSearch placeholder="Search..." />
    <DropdownList items={items} {...props} />
    <DropdownFooter>
        <button onClick={clearSelection}>Clear</button>
    </DropdownFooter>
</DropdownContent>
```

---

### DropdownSearch

Search input component for filtering items.

#### Props

| Prop          | Type                          | Default       | Description            |
| ------------- | ----------------------------- | ------------- | ---------------------- |
| `value`       | `string`                      | **Required**  | Current search query   |
| `onChange`    | `(value: string) => void`     | **Required**  | Search change callback |
| `placeholder` | `string`                      | `'Search...'` | Input placeholder      |
| `inputRef`    | `RefObject<HTMLInputElement>` | -             | Ref to input element   |
| `className`   | `string`                      | -             | Additional CSS class   |

#### Example

```tsx
const [query, setQuery] = useState("");

<DropdownSearch
    value={query}
    onChange={setQuery}
    placeholder="Type to filter..."
/>;
```

---

### DropdownList

Scrollable list component that renders dropdown items.

#### Props

| Prop                 | Type                                                              | Default      | Description                                  |
| -------------------- | ----------------------------------------------------------------- | ------------ | -------------------------------------------- |
| `items`              | `T[]`                                                             | **Required** | Items to display                             |
| `hasResults`         | `boolean`                                                         | **Required** | Whether there are results to show            |
| `selectedItem`       | `T \| null`                                                       | -            | Currently selected item                      |
| `onSelect`           | `(item: T) => void`                                               | -            | Selection callback (uses context if omitted) |
| `getItemKey`         | `(item: T) => string`                                             | **Required** | Get unique key for item                      |
| `getItemDisplay`     | `(item: T) => string`                                             | **Required** | Get display text for item                    |
| `renderItem`         | `(item: T, isSelected: boolean, onSelect: Function) => ReactNode` | -            | Custom item renderer                         |
| `getItemDescription` | `(item: T) => string \| null`                                     | -            | Get description text                         |
| `getItemIcon`        | `(item: T) => ReactNode`                                          | -            | Get icon element                             |
| `getItemSection`     | `(item: T) => DropdownSectionMeta \| null`                        | -            | Group into sections                          |
| `getItemSeparator`   | `(item: T, index: number) => boolean`                             | -            | Render divider ABOVE this item               |
| `getItemDisabled`    | `(item: T) => boolean`                                            | -            | Item disabled state                          |
| `getItemClassName`   | `(item, isSelected, isDisabled) => string`                        | -            | Custom item className                        |
| `staggered`          | `boolean`                                                         | `false`      | Use staggered item animations                |
| `staggerDelay`       | `number`                                                          | `0.04`       | Delay between staggered items                |
| `className`          | `string`                                                          | -            | Additional CSS class                         |

#### Example

```tsx
<DropdownList
    items={filteredItems}
    hasResults={filteredItems.length > 0}
    selectedItem={selected}
    getItemKey={(item) => item.id}
    getItemDisplay={(item) => item.name}
    getItemIcon={(item) => <Icon name={item.icon} />}
    staggered
/>
```

---

### DropdownHeader

Fixed header section at the top of dropdown content.

#### Props

| Prop        | Type        | Default | Description              |
| ----------- | ----------- | ------- | ------------------------ |
| `separator` | `boolean`   | `false` | Show border below header |
| `className` | `string`    | -       | Additional CSS class     |
| `children`  | `ReactNode` | -       | Header content           |

#### Example

```tsx
<DropdownHeader separator>
    <h3 className="font-semibold">Select Category</h3>
</DropdownHeader>
```

---

### DropdownFooter

Fixed footer section at the bottom of dropdown content.

#### Props

| Prop        | Type        | Default | Description              |
| ----------- | ----------- | ------- | ------------------------ |
| `separator` | `boolean`   | `true`  | Show border above footer |
| `className` | `string`    | -       | Additional CSS class     |
| `children`  | `ReactNode` | -       | Footer content           |

#### Example

```tsx
<DropdownFooter>
    <button onClick={handleClear}>Clear Selection</button>
</DropdownFooter>
```

---

### DropdownSearchable

Pre-built component combining search input and list.

```tsx
import { DropdownSearchable } from "@octavian-tocan/react-dropdown";
// or
<Dropdown.Searchable />;
```

#### Props

Inherits most props from `DropdownList`. Additional props:

| Prop                  | Type     | Default       | Description                                  |
| --------------------- | -------- | ------------- | -------------------------------------------- |
| `searchPlaceholder`   | `string` | `'Search...'` | Search input placeholder                     |
| `hideSearchThreshold` | `number` | -             | Hide search when `items.length <= threshold` |

#### Example

```tsx
<Dropdown.Root items={countries} {...config}>
    <Dropdown.Trigger displayValue={selected?.name} />
    <Dropdown.Searchable
        searchPlaceholder="Find country..."
        hideSearchThreshold={5}
    />
</Dropdown.Root>
```

---

### DropdownSimple

Pre-built component with list only (no search).

```tsx
<Dropdown.Simple />
```

Useful for small lists where filtering is unnecessary.

---

### DropdownMenu

Action menu variant optimized for context menus and action lists.

#### Props

| Prop                                          | Type                        | Default      | Description                 |
| --------------------------------------------- | --------------------------- | ------------ | --------------------------- |
| `items`                                       | `T[]`                       | **Required** | Menu items                  |
| `trigger`                                     | `ReactNode`                 | **Required** | Custom trigger element      |
| `onSelect`                                    | `(item: T) => void`         | **Required** | Selection callback          |
| `getItemKey`                                  | `(item: T) => string`       | **Required** | Get unique key              |
| `getItemDisplay`                              | `(item: T) => string`       | **Required** | Get display text            |
| `contentClassName`                            | `string`                    | -            | Content container className |
| `listClassName`                               | `string`                    | -            | List className              |
| `onOpenChange`                                | `(isOpen: boolean) => void` | -            | Open state callback         |
| _(Plus all accessor props from DropdownRoot)_ |                             |              |                             |

#### Example

```tsx
interface MenuItem {
    id: string;
    label: string;
    icon: ReactNode;
    action: () => void;
    dangerous?: boolean;
    divider?: boolean;
}

const menuItems: MenuItem[] = [
    { id: "edit", label: "Edit", icon: <PencilIcon />, action: handleEdit },
    {
        id: "duplicate",
        label: "Duplicate",
        icon: <CopyIcon />,
        action: handleDuplicate,
    },
    {
        id: "delete",
        label: "Delete",
        icon: <TrashIcon />,
        action: handleDelete,
        dangerous: true,
        divider: true,
    },
];

<DropdownMenu
    items={menuItems}
    trigger={
        <button>
            <MoreHorizontalIcon />
        </button>
    }
    onSelect={(item) => item.action()}
    getItemKey={(item) => item.id}
    getItemDisplay={(item) => item.label}
    getItemIcon={(item) => item.icon}
    getItemSeparator={(item) => item.divider ?? false}
    getItemClassName={(item) => (item.dangerous ? "text-red-500" : "")}
    contentClassName="min-w-[180px] bg-white rounded-lg shadow-lg p-1"
/>;
```

---

## Keyboard interaction

`DropdownMenu` (and any custom composition that wires `useMenuKeyboard`) ships
the same keyboard surface Radix's `DropdownMenu` provides:

| Key                    | Behavior                                                      |
| ---------------------- | ------------------------------------------------------------- |
| `ArrowDown`            | Move focus to next enabled item (wraps at the end)            |
| `ArrowUp`              | Move focus to previous enabled item (wraps at the start)      |
| `Home`                 | Jump focus to the first enabled item                          |
| `End`                  | Jump focus to the last enabled item                           |
| `Enter` / `Space`      | Activate the focused item (no-op when disabled)               |
| `Escape`               | Close the menu                                                |
| `Tab` / `Shift+Tab`    | Leave the menu (focus returns to the trigger via close)       |
| Alphanumeric           | Type-ahead — buffer (500 ms) jumps to the first item whose display starts with the typed prefix |

The active item is reported via `aria-activedescendant` and exposed on `<li>`
as `data-focused="true"` for styling. Hover keeps keyboard focus in sync via
an `onMouseEnter` that updates the focused index.

---

## Hooks

### useMenuKeyboard

Headless hook for action-menu keyboard interaction. Used internally by
`DropdownMenu`; export to wire the same surface into custom compositions
built on `Dropdown.Root` + `Dropdown.Content` + `Dropdown.List`.

```tsx
import { useMenuKeyboard } from "@octavian-tocan/react-dropdown";

const { focusedIndex, handleKeyDown, getItemTabIndex, setFocusedIndex } =
    useMenuKeyboard({
        items,
        isOpen,
        getItemDisplay: (item) => item.label,
        getItemDisabled: (item) => item.disabled === true,
        onActivate: (item) => item.onClick(),
        onClose: closeDropdown,
    });

// Spread `handleKeyDown` onto the menu container, drive `aria-activedescendant`
// from focusedIndex, and forward `focusedIndex` to `Dropdown.List` so the
// active row gets `data-focused="true"`.
```

Returns:

| Field             | Type                                  | Description                                                        |
| ----------------- | ------------------------------------- | ------------------------------------------------------------------ |
| `focusedIndex`    | `number`                              | Index of the currently focused item; `-1` when nothing is focused  |
| `handleKeyDown`   | `(event: React.KeyboardEvent) => void`| Wire onto the menu container's `onKeyDown`                         |
| `getItemTabIndex` | `(index: number) => number`           | Returns `0` for the focused item and `-1` otherwise                |
| `setFocusedIndex` | `(index: number) => void`             | Updates the focused index — call from `onMouseEnter` for parity    |

### useDropdownContext

Access the dropdown context from any child component.

```tsx
import { useDropdownContext } from "@octavian-tocan/react-dropdown";

function CustomDropdownItem<T>() {
    const {
        isOpen,
        selectedItem,
        filteredItems,
        onSelect,
        closeDropdown,
        searchQuery,
        setSearchQuery,
        animationState,
        computedPlacement,
    } = useDropdownContext<T>();

    // Build custom UI using context...
}
```

#### Returns: `DropdownContextValue<T>`

| Property                        | Type                                | Description                    |
| ------------------------------- | ----------------------------------- | ------------------------------ |
| `isOpen`                        | `boolean`                           | Current open state             |
| `setIsOpen`                     | `(open: boolean) => void`           | Set open state                 |
| `selectedItem`                  | `T \| null`                         | Currently selected item        |
| `setSelectedItem`               | `(item: T \| null) => void`         | Set selected item              |
| `searchQuery`                   | `string`                            | Current search query           |
| `setSearchQuery`                | `(query: string) => void`           | Set search query               |
| `items`                         | `T[]`                               | All items                      |
| `filteredItems`                 | `T[]`                               | Filtered items based on search |
| `onSelect`                      | `(item: T) => void`                 | Handle item selection          |
| `closeDropdown`                 | `() => void`                        | Close with exit animation      |
| `closeImmediate`                | `() => void`                        | Close immediately              |
| `toggleDropdown`                | `() => void`                        | Toggle open/closed             |
| `disabled`                      | `boolean`                           | Disabled state                 |
| `closeOnSelect`                 | `boolean`                           | Close on selection setting     |
| `animationState`                | `'entering' \| 'exiting' \| 'idle'` | Current animation state        |
| `computedPlacement`             | `'top' \| 'bottom'`                 | Resolved placement             |
| `offset`                        | `number`                            | Offset in pixels               |
| `enterDuration`                 | `number`                            | Enter animation duration       |
| `exitDuration`                  | `number`                            | Exit animation duration        |
| _(Plus all accessor functions)_ |                                     |                                |

---

### useKeyboardNavigation

Hook for managing keyboard navigation within the dropdown.

```tsx
import { useKeyboardNavigation } from "@octavian-tocan/react-dropdown";

const { handleKeyDown, focusedIndex, resetFocus } = useKeyboardNavigation(
    items,
    getItemKey,
    onSelect,
    closeDropdown,
);

<div onKeyDown={handleKeyDown}>
    {items.map((item, index) => (
        <div
            key={getItemKey(item)}
            className={focusedIndex === index ? "bg-blue-100" : ""}
        >
            {getItemDisplay(item)}
        </div>
    ))}
</div>;
```

#### Parameters

| Parameter       | Type                  | Description        |
| --------------- | --------------------- | ------------------ |
| `items`         | `T[]`                 | Items to navigate  |
| `getItemKey`    | `(item: T) => string` | Get item key       |
| `onSelect`      | `(item: T) => void`   | Selection callback |
| `closeDropdown` | `() => void`          | Close callback     |

#### Returns

| Property        | Type                             | Description                  |
| --------------- | -------------------------------- | ---------------------------- |
| `handleKeyDown` | `(event: KeyboardEvent) => void` | Keyboard event handler       |
| `focusedIndex`  | `number`                         | Currently focused item index |
| `resetFocus`    | `() => void`                     | Reset focus to -1            |

**Keyboard Shortcuts:**

- `ArrowDown` - Move focus down
- `ArrowUp` - Move focus up
- `Enter` - Select focused item
- `Escape` - Close dropdown

---

### useClickOutside

Hook for detecting clicks outside the dropdown.

```tsx
import { useClickOutside } from "@octavian-tocan/react-dropdown";

const dropdownRef = useRef<HTMLDivElement>(null);

useClickOutside(dropdownRef, closeDropdown, isOpen);

<div ref={dropdownRef}>{/* Dropdown content */}</div>;
```

#### Parameters

| Parameter       | Type                     | Description             |
| --------------- | ------------------------ | ----------------------- |
| `ref`           | `RefObject<HTMLElement>` | Ref to dropdown element |
| `closeDropdown` | `() => void`             | Close callback          |
| `isOpen`        | `boolean`                | Current open state      |

---

## Types

### DropdownPlacement

```typescript
type DropdownPlacement = "bottom" | "top" | "auto";
```

### DropdownAnimationState

```typescript
type DropdownAnimationState = "entering" | "exiting" | "idle";
```

### DropdownSectionMeta

```typescript
interface DropdownSectionMeta {
    key: string; // Unique section identifier
    label: string; // Section header text
    description?: string; // Optional description
    icon?: ReactNode; // Optional icon
}
```

### DropdownRootProps<T>

Full props interface for DropdownRoot. See [DropdownRoot Props](#props) above.

### DropdownContextValue<T>

Full context value interface. See [useDropdownContext Returns](#returns-dropdowncontextvaluet) above.

### BaseDropdownProps

```typescript
interface BaseDropdownProps {
    className?: string;
    "data-testid"?: string;
    children?: ReactNode;
}
```

---

## Imports

```tsx
// Default compound export
import Dropdown from "@octavian-tocan/react-dropdown";
// Use as: Dropdown.Root, Dropdown.Trigger, Dropdown.Menu, etc.

// Named exports
import {
    DropdownRoot,
    DropdownTrigger,
    DropdownContent,
    DropdownSearch,
    DropdownList,
    DropdownHeader,
    DropdownFooter,
    DropdownSearchable,
    DropdownSimple,
    DropdownMenu,
    // JSX-children panel-mode menu (Radix-DropdownMenu parity)
    DropdownPanelMenu,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuShortcut,
    // Right-click context menu family
    DropdownContextMenu,
    DropdownContextMenuTrigger,
    DropdownContextMenuContent,
    DropdownProvider,
    useDropdownContext,
    useKeyboardNavigation,
    useClickOutside,
} from "@octavian-tocan/react-dropdown";

// Type imports
import type {
    DropdownRootProps,
    DropdownTriggerProps,
    DropdownContentProps,
    DropdownSearchProps,
    DropdownListProps,
    DropdownMenuProps,
    DropdownContextValue,
    DropdownSectionMeta,
    DropdownPlacement,
    DropdownAnimationState,
    DropdownHeaderProps,
    DropdownFooterProps,
} from "@octavian-tocan/react-dropdown";
```
