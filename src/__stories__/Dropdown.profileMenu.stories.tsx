/**
 * @file Dropdown.profileMenu.stories.tsx
 * @brief Stories demonstrating new dropdown features with ProfileDropdownMenu pattern
 */

import React, { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Dropdown, {
  DropdownRoot,
  DropdownTrigger,
  DropdownContent,
  DropdownList,
  DropdownHeader,
  DropdownFooter,
  useDropdownContext,
} from "../index";

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  description?: string;
  danger?: boolean;
}

const menuItems: MenuItem[] = [
  { id: "profile", label: "View Profile", icon: "👤", description: "See your public profile" },
  { id: "settings", label: "Settings", icon: "⚙️", description: "Manage preferences" },
  { id: "billing", label: "Billing", icon: "💳", description: "Payment methods" },
  { id: "help", label: "Help & Support", icon: "❓" },
  { id: "logout", label: "Sign Out", icon: "🚪", danger: true },
];

const user = {
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "JD",
};

// Avatar Trigger Component that uses context
function AvatarTrigger({ triggerRef }: { triggerRef: React.RefObject<HTMLButtonElement> }) {
  const { toggleDropdown, isOpen } = useDropdownContext();

  return (
    <button
      ref={triggerRef}
      onClick={toggleDropdown}
      className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
    >
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
        {user.avatar}
      </div>
    </button>
  );
}

// User Info Footer Component
function UserInfoFooter() {
  return (
    <div className="px-3 py-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
        {user.avatar}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
        <p className="text-xs text-gray-500 truncate">{user.email}</p>
      </div>
    </div>
  );
}

// Custom trigger with name
function NamedAvatarTrigger({ triggerRef }: { triggerRef: React.RefObject<HTMLButtonElement> }) {
  const { toggleDropdown, isOpen } = useDropdownContext();

  return (
    <button
      ref={triggerRef}
      onClick={toggleDropdown}
      className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
    >
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
        {user.avatar}
      </div>
      <span className="text-sm font-medium text-gray-700">{user.name}</span>
      <svg
        className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

// Button trigger
function ButtonTrigger({
  triggerRef,
  label,
  className,
}: {
  triggerRef: React.RefObject<HTMLButtonElement>;
  label: string;
  className?: string;
}) {
  const { toggleDropdown, isOpen } = useDropdownContext();

  return (
    <button
      ref={triggerRef}
      onClick={toggleDropdown}
      className={className || "px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"}
    >
      {label}
    </button>
  );
}

// Upward trigger
function UpwardTrigger({ triggerRef }: { triggerRef: React.RefObject<HTMLButtonElement> }) {
  const { toggleDropdown, isOpen } = useDropdownContext();

  return (
    <button
      ref={triggerRef}
      onClick={toggleDropdown}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
    >
      <span className="text-sm font-medium">Opens Upward</span>
      <svg
        className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}

// Staggered trigger
function StaggeredTrigger({ triggerRef }: { triggerRef: React.RefObject<HTMLButtonElement> }) {
  const { toggleDropdown, isOpen } = useDropdownContext();

  return (
    <button
      ref={triggerRef}
      onClick={toggleDropdown}
      className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
    >
      {isOpen ? "Close Menu" : "Open Staggered Menu"}
    </button>
  );
}

const meta: Meta = {
  title: "Dropdown/Profile Menu",
  component: DropdownRoot,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="p-20">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof DropdownRoot>;

/**
 * Full-featured profile dropdown menu demonstrating:
 * - Smart auto-positioning
 * - Portal + backdrop
 * - Staggered item animations
 * - Footer with user info
 * - Custom animation durations
 */
export const ProfileMenuComplete: Story = {
  render: () => {
    const triggerRef = useRef<HTMLButtonElement>(null);

    return (
      <DropdownRoot<MenuItem>
        items={menuItems}
        onSelect={(item) => console.log("Selected:", item.label)}
        getItemKey={(item) => item.id}
        getItemDisplay={(item) => item.label}
        placement="auto"
        offset={8}
        enterDuration={0.2}
        exitDuration={0.15}
        triggerRef={triggerRef}
        usePortal
      >
        <AvatarTrigger triggerRef={triggerRef} />
        <DropdownContent portal backdrop backdropClassName="bg-black/10" className="min-w-[280px]">
          <DropdownList
            items={menuItems}
            hasResults
            getItemKey={(item) => item.id}
            getItemDisplay={(item) => item.label}
            getItemDescription={(item) => item.description}
            getItemIcon={(item) => <span className="text-lg">{item.icon}</span>}
            getItemClassName={(item) => (item.danger ? "text-red-600" : "")}
            staggered
            staggerDelay={0.04}
          />
          <DropdownFooter>
            <UserInfoFooter />
          </DropdownFooter>
        </DropdownContent>
      </DropdownRoot>
    );
  },
};

/**
 * Profile menu with header section
 */
export const ProfileMenuWithHeader: Story = {
  render: () => {
    const triggerRef = useRef<HTMLButtonElement>(null);

    return (
      <DropdownRoot<MenuItem>
        items={menuItems}
        onSelect={(item) => console.log("Selected:", item.label)}
        getItemKey={(item) => item.id}
        getItemDisplay={(item) => item.label}
        placement="bottom"
        enterDuration={0.2}
        exitDuration={0.15}
        triggerRef={triggerRef}
      >
        <NamedAvatarTrigger triggerRef={triggerRef} />
        <DropdownContent className="min-w-[280px]">
          <DropdownHeader separator className="px-3 py-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Account Menu</p>
          </DropdownHeader>
          <DropdownList
            items={menuItems}
            hasResults
            getItemKey={(item) => item.id}
            getItemDisplay={(item) => item.label}
            getItemIcon={(item) => <span className="text-lg">{item.icon}</span>}
            getItemClassName={(item) => (item.danger ? "text-red-600" : "")}
            staggered
          />
        </DropdownContent>
      </DropdownRoot>
    );
  },
};

/**
 * Profile menu opening upward (placement="top")
 */
export const ProfileMenuTopPlacement: Story = {
  render: () => {
    const triggerRef = useRef<HTMLButtonElement>(null);

    return (
      <div className="pt-[300px]">
        <DropdownRoot<MenuItem>
          items={menuItems}
          onSelect={(item) => console.log("Selected:", item.label)}
          getItemKey={(item) => item.id}
          getItemDisplay={(item) => item.label}
          placement="top"
          enterDuration={0.2}
          exitDuration={0.15}
          triggerRef={triggerRef}
        >
          <UpwardTrigger triggerRef={triggerRef} />
          <DropdownContent className="min-w-[240px]">
            <DropdownList
              items={menuItems}
              hasResults
              getItemKey={(item) => item.id}
              getItemDisplay={(item) => item.label}
              getItemIcon={(item) => <span className="text-lg">{item.icon}</span>}
              staggered
              staggerDelay={0.04}
            />
          </DropdownContent>
        </DropdownRoot>
      </div>
    );
  },
};

/**
 * Profile menu with backdrop overlay
 */
export const ProfileMenuWithBackdrop: Story = {
  render: () => {
    const triggerRef = useRef<HTMLButtonElement>(null);

    return (
      <DropdownRoot<MenuItem>
        items={menuItems}
        onSelect={(item) => console.log("Selected:", item.label)}
        getItemKey={(item) => item.id}
        getItemDisplay={(item) => item.label}
        placement="bottom"
        triggerRef={triggerRef}
      >
        <ButtonTrigger triggerRef={triggerRef} label="Open with Backdrop" />
        <DropdownContent backdrop backdropClassName="bg-black/20" className="min-w-[240px]">
          <DropdownList
            items={menuItems}
            hasResults
            getItemKey={(item) => item.id}
            getItemDisplay={(item) => item.label}
            getItemIcon={(item) => <span className="text-lg">{item.icon}</span>}
          />
        </DropdownContent>
      </DropdownRoot>
    );
  },
};

/**
 * Profile menu with portal rendering (escapes overflow clipping)
 */
export const ProfileMenuWithPortal: Story = {
  render: () => {
    const triggerRef = useRef<HTMLButtonElement>(null);

    return (
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden max-h-[100px]">
        <p className="text-xs text-gray-500 mb-2">Container with overflow:hidden - dropdown escapes using portal</p>
        <DropdownRoot<MenuItem>
          items={menuItems}
          onSelect={(item) => console.log("Selected:", item.label)}
          getItemKey={(item) => item.id}
          getItemDisplay={(item) => item.label}
          triggerRef={triggerRef}
          usePortal
        >
          <ButtonTrigger
            triggerRef={triggerRef}
            label="Open Portal Dropdown"
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
          />
          <DropdownContent portal className="min-w-[240px]">
            <DropdownList
              items={menuItems}
              hasResults
              getItemKey={(item) => item.id}
              getItemDisplay={(item) => item.label}
              getItemIcon={(item) => <span className="text-lg">{item.icon}</span>}
            />
          </DropdownContent>
        </DropdownRoot>
      </div>
    );
  },
};

/**
 * Profile menu demonstrating staggered animations
 */
export const ProfileMenuStaggered: Story = {
  render: () => {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const manyItems: MenuItem[] = [
      { id: "1", label: "Dashboard", icon: "📊" },
      { id: "2", label: "Projects", icon: "📁" },
      { id: "3", label: "Team", icon: "👥" },
      { id: "4", label: "Messages", icon: "💬" },
      { id: "5", label: "Calendar", icon: "📅" },
      { id: "6", label: "Reports", icon: "📈" },
      { id: "7", label: "Settings", icon: "⚙️" },
      { id: "8", label: "Logout", icon: "🚪", danger: true },
    ];

    return (
      <DropdownRoot<MenuItem>
        items={manyItems}
        onSelect={(item) => console.log("Selected:", item.label)}
        getItemKey={(item) => item.id}
        getItemDisplay={(item) => item.label}
        enterDuration={0.25}
        triggerRef={triggerRef}
      >
        <StaggeredTrigger triggerRef={triggerRef} />
        <DropdownContent className="min-w-[220px]">
          <DropdownList
            items={manyItems}
            hasResults
            getItemKey={(item) => item.id}
            getItemDisplay={(item) => item.label}
            getItemIcon={(item) => <span className="text-lg">{item.icon}</span>}
            getItemClassName={(item) => (item.danger ? "text-red-600" : "")}
            staggered
            staggerDelay={0.05}
          />
        </DropdownContent>
      </DropdownRoot>
    );
  },
};

/**
 * Using the compound component pattern with all new features
 */
export const CompoundComponentPattern: Story = {
  render: () => {
    return (
      <Dropdown.Root<MenuItem>
        items={menuItems}
        onSelect={(item) => console.log("Selected:", item.label)}
        getItemKey={(item) => item.id}
        getItemDisplay={(item) => item.label}
        placement="auto"
        enterDuration={0.2}
        exitDuration={0.15}
      >
        <Dropdown.Trigger displayValue="" placeholder="Select an option" />
        <Dropdown.Content backdrop>
          <Dropdown.Header separator className="px-3 py-2">
            <span className="text-xs font-medium text-gray-500 uppercase">Actions</span>
          </Dropdown.Header>
          <Dropdown.List
            items={menuItems}
            hasResults
            getItemKey={(item) => item.id}
            getItemDisplay={(item) => item.label}
            getItemIcon={(item) => <span className="text-lg">{item.icon}</span>}
            staggered
          />
          <Dropdown.Footer>
            <div className="px-3 py-2 text-xs text-gray-400">Press Esc to close</div>
          </Dropdown.Footer>
        </Dropdown.Content>
      </Dropdown.Root>
    );
  },
};
