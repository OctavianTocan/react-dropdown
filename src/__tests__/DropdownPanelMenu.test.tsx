/**
 * @file DropdownPanelMenu.test.tsx
 * @brief Behavior tests for the JSX-children panel-mode menu and item primitives.
 *
 * Covers:
 * - DropdownPanelMenu renders children when open and hides them when closed.
 * - DropdownMenuItem fires onSelect on click + keyboard activation.
 * - DropdownMenuItem closes the parent on activation (default) and stays open
 *   when `event.preventDefault()` is called.
 * - asChild composition merges props onto a custom child element.
 * - DropdownMenuSeparator / DropdownMenuLabel / DropdownMenuShortcut render.
 * - Disabled items don't fire onSelect or close the parent.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	DropdownPanelMenu,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuLabel,
	DropdownMenuShortcut,
} from "../index";

describe("DropdownPanelMenu", () => {
	it("renders the trigger and hides the panel by default", () => {
		render(
			<DropdownPanelMenu trigger={<button type="button">Open</button>} asChild>
				<DropdownMenuItem>Edit</DropdownMenuItem>
			</DropdownPanelMenu>,
		);

		expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
		// Panel content should not be in the DOM while closed.
		expect(screen.queryByRole("menuitem", { name: "Edit" })).not.toBeInTheDocument();
	});

	it("opens the panel on trigger click and shows the items", async () => {
		const user = userEvent.setup();
		render(
			<DropdownPanelMenu trigger={<button type="button">Open</button>} asChild>
				<DropdownMenuItem>Edit</DropdownMenuItem>
				<DropdownMenuItem>Delete</DropdownMenuItem>
			</DropdownPanelMenu>,
		);

		await user.click(screen.getByRole("button", { name: "Open" }));

		expect(await screen.findByRole("menuitem", { name: "Edit" })).toBeInTheDocument();
		expect(screen.getByRole("menuitem", { name: "Delete" })).toBeInTheDocument();
	});

	it("calls onSelect and closes the panel on item click", async () => {
		const onSelect = vi.fn();
		const user = userEvent.setup();
		render(
			<DropdownPanelMenu trigger={<button type="button">Open</button>} asChild>
				<DropdownMenuItem onSelect={onSelect}>Edit</DropdownMenuItem>
			</DropdownPanelMenu>,
		);

		await user.click(screen.getByRole("button", { name: "Open" }));
		const item = await screen.findByRole("menuitem", { name: "Edit" });
		await user.click(item);

		expect(onSelect).toHaveBeenCalledTimes(1);
		// After selection, the panel closes — the item is removed from the DOM
		// once the AnimatePresence exit motion resolves (≈100 ms).
		await waitFor(() => {
			expect(screen.queryByRole("menuitem", { name: "Edit" })).not.toBeInTheDocument();
		});
	});

	it("keeps the panel open when onSelect calls preventDefault", async () => {
		const onSelect = vi.fn((event: { preventDefault: () => void }) => {
			event.preventDefault();
		});
		const user = userEvent.setup();
		render(
			<DropdownPanelMenu trigger={<button type="button">Open</button>} asChild>
				<DropdownMenuItem onSelect={onSelect}>Add file</DropdownMenuItem>
			</DropdownPanelMenu>,
		);

		await user.click(screen.getByRole("button", { name: "Open" }));
		const item = await screen.findByRole("menuitem", { name: "Add file" });
		await user.click(item);

		expect(onSelect).toHaveBeenCalledTimes(1);
		// Panel stays mounted because the consumer prevented the default close.
		expect(screen.getByRole("menuitem", { name: "Add file" })).toBeInTheDocument();
	});

	it("does not fire onSelect or close when the item is disabled", async () => {
		const onSelect = vi.fn();
		const user = userEvent.setup();
		render(
			<DropdownPanelMenu trigger={<button type="button">Open</button>} asChild>
				<DropdownMenuItem disabled onSelect={onSelect}>
					Disabled
				</DropdownMenuItem>
			</DropdownPanelMenu>,
		);

		await user.click(screen.getByRole("button", { name: "Open" }));
		const item = await screen.findByRole("menuitem", { name: "Disabled" });
		await user.click(item);

		expect(onSelect).not.toHaveBeenCalled();
		// Panel is still open because the click did nothing.
		expect(screen.getByRole("menuitem", { name: "Disabled" })).toBeInTheDocument();
	});

	it("renders DropdownMenuItem asChild around an anchor", async () => {
		const user = userEvent.setup();
		render(
			<DropdownPanelMenu trigger={<button type="button">Open</button>} asChild>
				<DropdownMenuItem asChild>
					<a href="/profile">Profile</a>
				</DropdownMenuItem>
			</DropdownPanelMenu>,
		);

		await user.click(screen.getByRole("button", { name: "Open" }));
		const link = await screen.findByRole("menuitem", { name: "Profile" });
		// The actual rendered element should be the consumer's anchor, not a
		// wrapping <button>.
		expect(link.tagName).toBe("A");
		expect(link).toHaveAttribute("href", "/profile");
	});

	it("renders separator, label, and shortcut sub-elements", async () => {
		const user = userEvent.setup();
		render(
			<DropdownPanelMenu trigger={<button type="button">Open</button>} asChild>
				<DropdownMenuLabel>Account</DropdownMenuLabel>
				<DropdownMenuItem>
					Profile
					<DropdownMenuShortcut>Cmd+P</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
			</DropdownPanelMenu>,
		);

		await user.click(screen.getByRole("button", { name: "Open" }));

		expect(await screen.findByText("Account")).toBeInTheDocument();
		expect(screen.getByText("Cmd+P")).toBeInTheDocument();
		expect(screen.getByRole("separator")).toBeInTheDocument();
		expect(screen.getByRole("menuitem", { name: "Sign out" })).toHaveAttribute(
			"data-variant",
			"destructive",
		);
	});

	it("activates the item via Enter key", async () => {
		const onSelect = vi.fn();
		const user = userEvent.setup();
		render(
			<DropdownPanelMenu trigger={<button type="button">Open</button>} asChild>
				<DropdownMenuItem onSelect={onSelect}>Edit</DropdownMenuItem>
			</DropdownPanelMenu>,
		);

		await user.click(screen.getByRole("button", { name: "Open" }));
		const item = await screen.findByRole("menuitem", { name: "Edit" });
		// Focus the item, press Enter.
		item.focus();
		await user.keyboard("{Enter}");

		expect(onSelect).toHaveBeenCalledTimes(1);
	});
});
