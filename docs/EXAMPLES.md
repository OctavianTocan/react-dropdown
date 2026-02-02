# Examples & Recipes

Practical examples and common patterns for `@octavian-tocan/react-dropdown`.

## Table of Contents

- [Basic Examples](#basic-examples)
    - [Simple Select](#simple-select)
    - [Searchable Select](#searchable-select)
    - [Action Menu](#action-menu)
- [Advanced Examples](#advanced-examples)
    - [Grouped Items with Sections](#grouped-items-with-sections)
    - [Items with Icons and Descriptions](#items-with-icons-and-descriptions)
    - [Custom Item Rendering](#custom-item-rendering)
    - [Controlled Dropdown](#controlled-dropdown)
    - [Portal Rendering](#portal-rendering)
    - [Custom Filtering](#custom-filtering)
- [Real-World Examples](#real-world-examples)
    - [Language Selector](#language-selector)
    - [User Picker with Avatars](#user-picker-with-avatars)
    - [AI Model Selector](#ai-model-selector)
    - [Profile Menu](#profile-menu)
    - [Multi-Action Context Menu](#multi-action-context-menu)
- [Recipes](#recipes)
    - [Async Data Loading](#async-data-loading)
    - [Multi-Select Pattern](#multi-select-pattern)
    - [Nested Dropdowns](#nested-dropdowns)
    - [Form Integration](#form-integration)

---

## Basic Examples

### Simple Select

A basic dropdown without search functionality:

```tsx
import Dropdown from "@octavian-tocan/react-dropdown";
import { useState } from "react";

interface Priority {
    id: string;
    label: string;
    color: string;
}

const priorities: Priority[] = [
    { id: "low", label: "Low", color: "green" },
    { id: "medium", label: "Medium", color: "yellow" },
    { id: "high", label: "High", color: "orange" },
    { id: "critical", label: "Critical", color: "red" },
];

function PrioritySelect() {
    const [selected, setSelected] = useState<Priority | null>(null);

    return (
        <Dropdown.Root
            items={priorities}
            selectedItem={selected}
            onSelect={setSelected}
            getItemKey={(p) => p.id}
            getItemDisplay={(p) => p.label}
        >
            <Dropdown.Trigger displayValue={selected?.label || ""} placeholder="Select priority..." />
            <Dropdown.Simple />
        </Dropdown.Root>
    );
}
```

### Searchable Select

Dropdown with built-in search filtering:

```tsx
import Dropdown from "@octavian-tocan/react-dropdown";
import { useState } from "react";

interface Country {
    code: string;
    name: string;
    flag: string;
}

const countries: Country[] = [
    { code: "US", name: "United States", flag: "🇺🇸" },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
    { code: "DE", name: "Germany", flag: "🇩🇪" },
    { code: "FR", name: "France", flag: "🇫🇷" },
    { code: "JP", name: "Japan", flag: "🇯🇵" },
    // ... more countries
];

function CountrySelect() {
    const [selected, setSelected] = useState<Country | null>(null);

    return (
        <Dropdown.Root
            items={countries}
            selectedItem={selected}
            onSelect={setSelected}
            getItemKey={(c) => c.code}
            getItemDisplay={(c) => `${c.flag} ${c.name}`}
        >
            <Dropdown.Trigger
                displayValue={selected ? `${selected.flag} ${selected.name}` : ""}
                placeholder="Select country..."
            />
            <Dropdown.Searchable searchPlaceholder="Search countries..." />
        </Dropdown.Root>
    );
}
```

### Action Menu

Context menu for actions (not selection):

```tsx
import Dropdown from "@octavian-tocan/react-dropdown";
import { MoreHorizontal, Edit, Copy, Trash, Share } from "lucide-react";

interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    action: () => void;
    dangerous?: boolean;
    divider?: boolean;
}

function ActionMenu({ onEdit, onDuplicate, onShare, onDelete }) {
    const items: MenuItem[] = [
        { id: "edit", label: "Edit", icon: <Edit size={16} />, action: onEdit },
        { id: "duplicate", label: "Duplicate", icon: <Copy size={16} />, action: onDuplicate },
        { id: "share", label: "Share", icon: <Share size={16} />, action: onShare },
        {
            id: "delete",
            label: "Delete",
            icon: <Trash size={16} />,
            action: onDelete,
            dangerous: true,
            divider: true,
        },
    ];

    return (
        <Dropdown.Menu
            items={items}
            trigger={
                <button className="p-2 hover:bg-gray-100 rounded">
                    <MoreHorizontal size={20} />
                </button>
            }
            onSelect={(item) => item.action()}
            getItemKey={(item) => item.id}
            getItemDisplay={(item) => item.label}
            getItemIcon={(item) => item.icon}
            getItemSeparator={(item) => item.divider ?? false}
            getItemClassName={(item) => (item.dangerous ? "text-red-600 hover:bg-red-50" : "")}
            contentClassName="min-w-[160px] bg-white border rounded-lg shadow-lg p-1"
        />
    );
}
```

---

## Advanced Examples

### Grouped Items with Sections

Group items into labeled sections:

```tsx
import Dropdown from "@octavian-tocan/react-dropdown";
import type { DropdownSectionMeta } from "@octavian-tocan/react-dropdown";

interface Command {
    id: string;
    label: string;
    shortcut?: string;
    category: "file" | "edit" | "view";
}

const commands: Command[] = [
    { id: "new", label: "New File", shortcut: "⌘N", category: "file" },
    { id: "open", label: "Open...", shortcut: "⌘O", category: "file" },
    { id: "save", label: "Save", shortcut: "⌘S", category: "file" },
    { id: "undo", label: "Undo", shortcut: "⌘Z", category: "edit" },
    { id: "redo", label: "Redo", shortcut: "⌘⇧Z", category: "edit" },
    { id: "zoom-in", label: "Zoom In", shortcut: "⌘+", category: "view" },
    { id: "zoom-out", label: "Zoom Out", shortcut: "⌘-", category: "view" },
];

const categoryLabels: Record<string, string> = {
    file: "File",
    edit: "Edit",
    view: "View",
};

function CommandPalette() {
    const [selected, setSelected] = useState<Command | null>(null);

    return (
        <Dropdown.Root
            items={commands}
            selectedItem={selected}
            onSelect={setSelected}
            getItemKey={(cmd) => cmd.id}
            getItemDisplay={(cmd) => cmd.label}
            getItemSection={(cmd): DropdownSectionMeta => ({
                key: cmd.category,
                label: categoryLabels[cmd.category],
            })}
            getItemDescription={(cmd) => cmd.shortcut || null}
        >
            <Dropdown.Trigger displayValue={selected?.label || ""} placeholder="Run command..." />
            <Dropdown.Searchable />
        </Dropdown.Root>
    );
}
```

### Items with Icons and Descriptions

Rich items with icons and secondary text:

```tsx
import Dropdown from "@octavian-tocan/react-dropdown";
import { CreditCard, Building, Wallet, PiggyBank } from "lucide-react";

interface PaymentMethod {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    disabled?: boolean;
}

const paymentMethods: PaymentMethod[] = [
    {
        id: "card",
        name: "Credit Card",
        description: "Pay with Visa, Mastercard, or Amex",
        icon: <CreditCard size={20} />,
    },
    {
        id: "bank",
        name: "Bank Transfer",
        description: "Direct bank-to-bank transfer",
        icon: <Building size={20} />,
    },
    {
        id: "wallet",
        name: "Digital Wallet",
        description: "PayPal, Apple Pay, Google Pay",
        icon: <Wallet size={20} />,
    },
    {
        id: "crypto",
        name: "Cryptocurrency",
        description: "Coming soon",
        icon: <PiggyBank size={20} />,
        disabled: true,
    },
];

function PaymentSelect() {
    const [selected, setSelected] = useState<PaymentMethod | null>(null);

    return (
        <Dropdown.Root
            items={paymentMethods}
            selectedItem={selected}
            onSelect={setSelected}
            getItemKey={(pm) => pm.id}
            getItemDisplay={(pm) => pm.name}
            getItemDescription={(pm) => pm.description}
            getItemIcon={(pm) => pm.icon}
            getItemDisabled={(pm) => pm.disabled ?? false}
        >
            <Dropdown.Trigger displayValue={selected?.name || ""} placeholder="Select payment method..." />
            <Dropdown.Simple />
        </Dropdown.Root>
    );
}
```

### Custom Item Rendering

Full control over item appearance:

```tsx
import Dropdown from "@octavian-tocan/react-dropdown";

interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    status: "online" | "away" | "offline";
}

function UserSelect({ users }: { users: User[] }) {
    const [selected, setSelected] = useState<User | null>(null);

    return (
        <Dropdown.Root
            items={users}
            selectedItem={selected}
            onSelect={setSelected}
            getItemKey={(u) => u.id}
            getItemDisplay={(u) => u.name}
        >
            <Dropdown.Trigger displayValue={selected?.name || ""} placeholder="Assign to..." />
            <Dropdown.Content>
                <Dropdown.Search placeholder="Find user..." />
                <Dropdown.List
                    items={users}
                    hasResults={users.length > 0}
                    selectedItem={selected}
                    getItemKey={(u) => u.id}
                    getItemDisplay={(u) => u.name}
                    renderItem={(user, isSelected, onSelect) => (
                        <button
                            onClick={() => onSelect(user)}
                            className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg
                ${isSelected ? "bg-blue-100" : "hover:bg-gray-100"}
              `}
                        >
                            <div className="relative">
                                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                                <span
                                    className={`
                    absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                    ${user.status === "online" ? "bg-green-500" : ""}
                    ${user.status === "away" ? "bg-yellow-500" : ""}
                    ${user.status === "offline" ? "bg-gray-400" : ""}
                  `}
                                />
                            </div>
                            <div className="flex-1 text-left">
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                            {isSelected && <Check size={16} className="text-blue-600" />}
                        </button>
                    )}
                />
            </Dropdown.Content>
        </Dropdown.Root>
    );
}
```

### Controlled Dropdown

External control of open state:

```tsx
import Dropdown from "@octavian-tocan/react-dropdown";
import { useState } from "react";

function ControlledDropdown() {
    const [items] = useState([
        { id: "1", name: "Option 1" },
        { id: "2", name: "Option 2" },
        { id: "3", name: "Option 3" },
    ]);
    const [selected, setSelected] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <button onClick={() => setIsOpen(true)}>Open Dropdown Externally</button>

            <Dropdown.Root
                items={items}
                selectedItem={selected}
                onSelect={(item) => {
                    setSelected(item);
                    // Custom logic before closing
                    console.log("Selected:", item);
                }}
                getItemKey={(item) => item.id}
                getItemDisplay={(item) => item.name}
                onOpenChange={setIsOpen}
                closeOnSelect={true}
            >
                <Dropdown.Trigger displayValue={selected?.name || ""} />
                <Dropdown.Simple />
            </Dropdown.Root>

            <p>Dropdown is: {isOpen ? "Open" : "Closed"}</p>
        </div>
    );
}
```

### Portal Rendering

Render dropdown outside parent container to avoid overflow clipping:

```tsx
import Dropdown from "@octavian-tocan/react-dropdown";
import { useRef, useState } from "react";

function DropdownInOverflowContainer() {
    const [selected, setSelected] = useState(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const items = [
        { id: "1", name: "Option 1" },
        { id: "2", name: "Option 2" },
        { id: "3", name: "Option 3" },
    ];

    return (
        <div className="overflow-hidden h-[100px] border">
            <Dropdown.Root
                items={items}
                selectedItem={selected}
                onSelect={setSelected}
                getItemKey={(i) => i.id}
                getItemDisplay={(i) => i.name}
                usePortal={true}
                triggerRef={triggerRef}
            >
                <Dropdown.Trigger ref={triggerRef} displayValue={selected?.name || ""} placeholder="Select..." />
                <Dropdown.Simple />
            </Dropdown.Root>
        </div>
    );
}
```

### Custom Filtering

Implement advanced search logic:

```tsx
import Dropdown from "@octavian-tocan/react-dropdown";
import Fuse from "fuse.js";

interface Product {
    id: string;
    name: string;
    category: string;
    sku: string;
}

function ProductSearch({ products }: { products: Product[] }) {
    const [selected, setSelected] = useState<Product | null>(null);

    // Fuzzy search with Fuse.js
    const fuse = useMemo(
        () =>
            new Fuse(products, {
                keys: ["name", "category", "sku"],
                threshold: 0.3,
            }),
        [products]
    );

    const filterItems = useCallback(
        (items: Product[], query: string) => {
            if (!query.trim()) return items;
            return fuse.search(query).map((result) => result.item);
        },
        [fuse]
    );

    return (
        <Dropdown.Root
            items={products}
            selectedItem={selected}
            onSelect={setSelected}
            getItemKey={(p) => p.id}
            getItemDisplay={(p) => p.name}
            getItemDescription={(p) => `${p.category} • ${p.sku}`}
            filterItems={filterItems}
        >
            <Dropdown.Trigger displayValue={selected?.name || ""} placeholder="Search products..." />
            <Dropdown.Searchable searchPlaceholder="Search by name, category, or SKU..." />
        </Dropdown.Root>
    );
}
```

---

## Real-World Examples

### Language Selector

```tsx
import Dropdown from "@octavian-tocan/react-dropdown";
import { Globe } from "lucide-react";

interface Language {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
}

const languages: Language[] = [
    { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
    { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
    { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
    { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
    { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
    { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
];

function LanguageSelector() {
    const [language, setLanguage] = useState<Language>(languages[0]);

    return (
        <Dropdown.Root
            items={languages}
            selectedItem={language}
            onSelect={setLanguage}
            getItemKey={(l) => l.code}
            getItemDisplay={(l) => `${l.flag} ${l.name}`}
            getItemDescription={(l) => l.nativeName}
        >
            <Dropdown.Trigger displayValue={`${language.flag} ${language.name}`} className="flex items-center gap-2">
                <Globe size={16} />
                <span>
                    {language.flag} {language.name}
                </span>
            </Dropdown.Trigger>
            <Dropdown.Searchable hideSearchThreshold={5} searchPlaceholder="Find language..." />
        </Dropdown.Root>
    );
}
```

### User Picker with Avatars

```tsx
import Dropdown from "@octavian-tocan/react-dropdown";
import { Users } from "lucide-react";

interface TeamMember {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    team: string;
}

function AssigneePicker({ members, onAssign }) {
    const [assignee, setAssignee] = useState<TeamMember | null>(null);

    const handleSelect = (member: TeamMember) => {
        setAssignee(member);
        onAssign(member);
    };

    return (
        <Dropdown.Root
            items={members}
            selectedItem={assignee}
            onSelect={handleSelect}
            getItemKey={(m) => m.id}
            getItemDisplay={(m) => m.name}
            getItemDescription={(m) => m.role}
            getItemIcon={(m) => <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full" />}
            getItemSection={(m) => ({
                key: m.team,
                label: m.team,
                icon: <Users size={14} />,
            })}
        >
            <Dropdown.Trigger displayValue={assignee?.name || ""} placeholder="Assign to..." />
            <Dropdown.Searchable searchPlaceholder="Find team member..." />
        </Dropdown.Root>
    );
}
```

### AI Model Selector

```tsx
import Dropdown from "@octavian-tocan/react-dropdown";
import { Sparkles, Zap, Brain } from "lucide-react";

interface AIModel {
    id: string;
    name: string;
    description: string;
    capabilities: string[];
    tier: "free" | "pro" | "enterprise";
}

const models: AIModel[] = [
    {
        id: "gpt-4",
        name: "GPT-4",
        description: "Most capable model for complex tasks",
        capabilities: ["Reasoning", "Code", "Analysis"],
        tier: "pro",
    },
    {
        id: "gpt-3.5",
        name: "GPT-3.5 Turbo",
        description: "Fast and efficient for most tasks",
        capabilities: ["Chat", "Code", "Writing"],
        tier: "free",
    },
    {
        id: "claude-3",
        name: "Claude 3 Opus",
        description: "Advanced reasoning and analysis",
        capabilities: ["Reasoning", "Research", "Code"],
        tier: "enterprise",
    },
];

const tierIcons = {
    free: <Zap size={14} className="text-gray-400" />,
    pro: <Sparkles size={14} className="text-yellow-500" />,
    enterprise: <Brain size={14} className="text-purple-500" />,
};

function ModelSelector() {
    const [model, setModel] = useState<AIModel>(models[0]);

    return (
        <Dropdown.Root
            items={models}
            selectedItem={model}
            onSelect={setModel}
            getItemKey={(m) => m.id}
            getItemDisplay={(m) => m.name}
            getItemDescription={(m) => m.description}
            getItemIcon={(m) => tierIcons[m.tier]}
        >
            <Dropdown.Trigger displayValue={model.name} />
            <Dropdown.Simple />
        </Dropdown.Root>
    );
}
```

### Profile Menu

```tsx
import Dropdown from "@octavian-tocan/react-dropdown";
import { User, Settings, HelpCircle, LogOut, ChevronDown, Moon, Sun } from "lucide-react";

interface ProfileMenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    action: () => void;
    divider?: boolean;
    dangerous?: boolean;
}

function ProfileMenu({ user, onLogout }) {
    const [theme, setTheme] = useState<"light" | "dark">("light");

    const menuItems: ProfileMenuItem[] = [
        {
            id: "profile",
            label: "View Profile",
            icon: <User size={16} />,
            action: () => navigate("/profile"),
        },
        {
            id: "settings",
            label: "Settings",
            icon: <Settings size={16} />,
            action: () => navigate("/settings"),
        },
        {
            id: "theme",
            label: theme === "light" ? "Dark Mode" : "Light Mode",
            icon: theme === "light" ? <Moon size={16} /> : <Sun size={16} />,
            action: () => setTheme((t) => (t === "light" ? "dark" : "light")),
        },
        {
            id: "help",
            label: "Help & Support",
            icon: <HelpCircle size={16} />,
            action: () => window.open("/help"),
            divider: true,
        },
        {
            id: "logout",
            label: "Log Out",
            icon: <LogOut size={16} />,
            action: onLogout,
            dangerous: true,
        },
    ];

    return (
        <Dropdown.Menu
            items={menuItems}
            trigger={
                <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                    <span className="font-medium">{user.name}</span>
                    <ChevronDown size={16} />
                </button>
            }
            onSelect={(item) => item.action()}
            getItemKey={(item) => item.id}
            getItemDisplay={(item) => item.label}
            getItemIcon={(item) => item.icon}
            getItemSeparator={(item) => item.divider ?? false}
            getItemClassName={(item) => (item.dangerous ? "text-red-600" : "")}
            contentClassName="min-w-[200px] bg-white border rounded-xl shadow-lg p-1"
        />
    );
}
```

### Multi-Action Context Menu

```tsx
import Dropdown from "@octavian-tocan/react-dropdown";
import { MoreVertical, Edit, Trash, Copy, Share, Archive, Star, Flag, Link } from "lucide-react";

function FileContextMenu({ file, onAction }) {
    const items = [
        { id: "edit", label: "Edit", icon: <Edit size={16} />, group: "primary" },
        { id: "duplicate", label: "Duplicate", icon: <Copy size={16} />, group: "primary" },
        { id: "share", label: "Share", icon: <Share size={16} />, group: "primary" },
        { id: "link", label: "Copy Link", icon: <Link size={16} />, group: "primary" },
        {
            id: "star",
            label: file.starred ? "Unstar" : "Star",
            icon: <Star size={16} />,
            group: "organize",
            divider: true,
        },
        { id: "flag", label: "Flag", icon: <Flag size={16} />, group: "organize" },
        { id: "archive", label: "Archive", icon: <Archive size={16} />, group: "organize" },
        { id: "delete", label: "Delete", icon: <Trash size={16} />, group: "danger", divider: true, dangerous: true },
    ];

    return (
        <Dropdown.Menu
            items={items}
            trigger={
                <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical size={18} />
                </button>
            }
            onSelect={(item) => onAction(item.id, file)}
            getItemKey={(i) => i.id}
            getItemDisplay={(i) => i.label}
            getItemIcon={(i) => i.icon}
            getItemSeparator={(i) => i.divider ?? false}
            getItemClassName={(i) => (i.dangerous ? "text-red-600 hover:bg-red-50" : "")}
            placement="bottom"
        />
    );
}
```

---

## Recipes

### Async Data Loading

Load items asynchronously:

```tsx
import Dropdown from "@octavian-tocan/react-dropdown";
import { useState, useEffect } from "react";

function AsyncDropdown() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        async function fetchItems() {
            setLoading(true);
            const response = await fetch("/api/items");
            const data = await response.json();
            setItems(data);
            setLoading(false);
        }
        fetchItems();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Dropdown.Root
            items={items}
            selectedItem={selected}
            onSelect={setSelected}
            getItemKey={(i) => i.id}
            getItemDisplay={(i) => i.name}
        >
            <Dropdown.Trigger displayValue={selected?.name || ""} />
            <Dropdown.Searchable />
        </Dropdown.Root>
    );
}
```

### Multi-Select Pattern

Track multiple selections (dropdown stays open):

```tsx
import Dropdown from "@octavian-tocan/react-dropdown";
import { useState } from "react";
import { Check } from "lucide-react";

interface Tag {
    id: string;
    name: string;
    color: string;
}

function MultiSelectTags({ tags }: { tags: Tag[] }) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleTag = (tag: Tag) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(tag.id)) {
                next.delete(tag.id);
            } else {
                next.add(tag.id);
            }
            return next;
        });
    };

    const selectedTags = tags.filter((t) => selectedIds.has(t.id));

    return (
        <Dropdown.Root
            items={tags}
            selectedItem={null}
            onSelect={toggleTag}
            getItemKey={(t) => t.id}
            getItemDisplay={(t) => t.name}
            closeOnSelect={false} // Keep open for multi-select
        >
            <Dropdown.Trigger
                displayValue={selectedTags.length > 0 ? `${selectedTags.length} selected` : ""}
                placeholder="Add tags..."
            />
            <Dropdown.Content>
                <Dropdown.List
                    items={tags}
                    hasResults
                    getItemKey={(t) => t.id}
                    getItemDisplay={(t) => t.name}
                    renderItem={(tag, _, onSelect) => {
                        const isSelected = selectedIds.has(tag.id);
                        return (
                            <button
                                onClick={() => onSelect(tag)}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100"
                            >
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                                <span className="flex-1">{tag.name}</span>
                                {isSelected && <Check size={16} className="text-blue-600" />}
                            </button>
                        );
                    }}
                />
            </Dropdown.Content>
        </Dropdown.Root>
    );
}
```

### Nested Dropdowns

Dropdown with sub-menus (using multiple dropdowns):

```tsx
import Dropdown from "@octavian-tocan/react-dropdown";
import { ChevronRight, File, Folder, Image, Code } from "lucide-react";

function NestedMenu() {
    const fileTypes = [
        { id: "doc", label: "Document", icon: <File size={16} /> },
        { id: "folder", label: "Folder", icon: <Folder size={16} /> },
        { id: "image", label: "Image", icon: <Image size={16} /> },
        { id: "code", label: "Code File", icon: <Code size={16} /> },
    ];

    return (
        <Dropdown.Menu
            items={[
                { id: "new", label: "New", hasSubmenu: true },
                { id: "open", label: "Open Recent" },
                { id: "save", label: "Save" },
            ]}
            trigger={<button>File</button>}
            onSelect={(item) => {
                if (item.id === "new") {
                    // Handle submenu differently
                }
            }}
            getItemKey={(i) => i.id}
            getItemDisplay={(i) => i.label}
            getItemIcon={(i) => (i.hasSubmenu ? <ChevronRight size={16} /> : null)}
        />
    );
}
```

### Form Integration

Use with React Hook Form:

```tsx
import Dropdown from "@octavian-tocan/react-dropdown";
import { useForm, Controller } from "react-hook-form";

interface FormData {
    country: Country | null;
}

function FormWithDropdown() {
    const { control, handleSubmit } = useForm<FormData>({
        defaultValues: { country: null },
    });

    const onSubmit = (data: FormData) => {
        console.log("Selected country:", data.country);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name="country"
                control={control}
                rules={{ required: "Please select a country" }}
                render={({ field, fieldState }) => (
                    <div>
                        <label>Country</label>
                        <Dropdown.Root
                            items={countries}
                            selectedItem={field.value}
                            onSelect={field.onChange}
                            getItemKey={(c) => c.code}
                            getItemDisplay={(c) => c.name}
                        >
                            <Dropdown.Trigger
                                displayValue={field.value?.name || ""}
                                placeholder="Select country..."
                                className={fieldState.error ? "border-red-500" : ""}
                            />
                            <Dropdown.Searchable />
                        </Dropdown.Root>
                        {fieldState.error && <span className="text-red-500 text-sm">{fieldState.error.message}</span>}
                    </div>
                )}
            />
            <button type="submit">Submit</button>
        </form>
    );
}
```
