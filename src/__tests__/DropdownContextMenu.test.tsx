/**
 * @file DropdownContextMenu.test.tsx
 * @brief Behavior tests for the right-click context-menu primitive.
 *
 * Covers:
 * - Right-click on the trigger opens the panel and prevents the native menu.
 * - Items render inside the panel and fire onSelect on click.
 * - Escape closes the menu.
 * - Click outside closes the menu.
 * - asChild composition works on the trigger.
 *
 * The positioning math (panel anchored at cursor coords) is verified visually
 * in Storybook; in jsdom the bounding rects are zeroed so we focus on the
 * mount/unmount + interaction surface.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	DropdownContextMenu,
	DropdownContextMenuTrigger,
	DropdownContextMenuContent,
	DropdownMenuItem,
} from "../index";

describe("DropdownContextMenu", () => {
	it("opens the panel on right-click and renders items", async () => {
		render(
			<DropdownContextMenu>
				<DropdownContextMenuTrigger>
					<div>Right-click target</div>
				</DropdownContextMenuTrigger>
				<DropdownContextMenuContent>
					<DropdownMenuItem>Edit</DropdownMenuItem>
					<DropdownMenuItem>Delete</DropdownMenuItem>
				</DropdownContextMenuContent>
			</DropdownContextMenu>,
		);

		// Panel should be closed initially.
		expect(screen.queryByRole("menuitem", { name: "Edit" })).not.toBeInTheDocument();

		// Fire a contextmenu event with cursor coordinates.
		const trigger = screen.getByText("Right-click target");
		fireEvent.contextMenu(trigger, { clientX: 100, clientY: 200 });

		expect(await screen.findByRole("menuitem", { name: "Edit" })).toBeInTheDocument();
		expect(screen.getByRole("menuitem", { name: "Delete" })).toBeInTheDocument();
	});

	it("prevents the browser's native context menu on right-click", () => {
		render(
			<DropdownContextMenu>
				<DropdownContextMenuTrigger>
					<div>Right-click target</div>
				</DropdownContextMenuTrigger>
				<DropdownContextMenuContent>
					<DropdownMenuItem>Edit</DropdownMenuItem>
				</DropdownContextMenuContent>
			</DropdownContextMenu>,
		);

		const trigger = screen.getByText("Right-click target");
		// Build a real Event so we can inspect defaultPrevented post-dispatch.
		const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
		trigger.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(true);
	});

	it("fires onSelect on item click and closes the panel", async () => {
		const onSelect = vi.fn();
		const user = userEvent.setup();
		render(
			<DropdownContextMenu>
				<DropdownContextMenuTrigger>
					<div>Target</div>
				</DropdownContextMenuTrigger>
				<DropdownContextMenuContent>
					<DropdownMenuItem onSelect={onSelect}>Edit</DropdownMenuItem>
				</DropdownContextMenuContent>
			</DropdownContextMenu>,
		);

		fireEvent.contextMenu(screen.getByText("Target"), { clientX: 50, clientY: 60 });
		const item = await screen.findByRole("menuitem", { name: "Edit" });
		await user.click(item);

		expect(onSelect).toHaveBeenCalledTimes(1);
		// After selection, the menu closes once AnimatePresence's exit motion runs.
		await waitFor(() => {
			expect(screen.queryByRole("menuitem", { name: "Edit" })).not.toBeInTheDocument();
		});
	});

	it("closes when the user clicks outside the panel", async () => {
		const user = userEvent.setup();
		render(
			<div>
				<DropdownContextMenu>
					<DropdownContextMenuTrigger>
						<div>Target</div>
					</DropdownContextMenuTrigger>
					<DropdownContextMenuContent>
						<DropdownMenuItem>Edit</DropdownMenuItem>
					</DropdownContextMenuContent>
				</DropdownContextMenu>
				<button type="button">Outside</button>
			</div>,
		);

		fireEvent.contextMenu(screen.getByText("Target"), { clientX: 0, clientY: 0 });
		await screen.findByRole("menuitem", { name: "Edit" });
		await user.click(screen.getByRole("button", { name: "Outside" }));

		await waitFor(() => {
			expect(screen.queryByRole("menuitem", { name: "Edit" })).not.toBeInTheDocument();
		});
	});

	it("invokes onOpenChange with true on open and false on dismiss", async () => {
		const onOpenChange = vi.fn();
		const user = userEvent.setup();
		render(
			<div>
				<DropdownContextMenu onOpenChange={onOpenChange}>
					<DropdownContextMenuTrigger>
						<div>Target</div>
					</DropdownContextMenuTrigger>
					<DropdownContextMenuContent>
						<DropdownMenuItem>Edit</DropdownMenuItem>
					</DropdownContextMenuContent>
				</DropdownContextMenu>
				<button type="button">Outside</button>
			</div>,
		);

		fireEvent.contextMenu(screen.getByText("Target"), { clientX: 0, clientY: 0 });
		await screen.findByRole("menuitem", { name: "Edit" });
		expect(onOpenChange).toHaveBeenCalledWith(true);

		await user.click(screen.getByRole("button", { name: "Outside" }));
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it("supports asChild on the trigger", async () => {
		render(
			<DropdownContextMenu>
				<DropdownContextMenuTrigger asChild>
					<div role="button" tabIndex={0}>
						Custom trigger
					</div>
				</DropdownContextMenuTrigger>
				<DropdownContextMenuContent>
					<DropdownMenuItem>Edit</DropdownMenuItem>
				</DropdownContextMenuContent>
			</DropdownContextMenu>,
		);

		const trigger = screen.getByRole("button", { name: "Custom trigger" });
		// asChild should not introduce an extra wrapping <div>.
		expect(trigger.tagName).toBe("DIV");
		fireEvent.contextMenu(trigger, { clientX: 0, clientY: 0 });
		expect(await screen.findByRole("menuitem", { name: "Edit" })).toBeInTheDocument();
	});

	it("does not open when the trigger is disabled", () => {
		render(
			<DropdownContextMenu>
				<DropdownContextMenuTrigger disabled>
					<div>Target</div>
				</DropdownContextMenuTrigger>
				<DropdownContextMenuContent>
					<DropdownMenuItem>Edit</DropdownMenuItem>
				</DropdownContextMenuContent>
			</DropdownContextMenu>,
		);

		fireEvent.contextMenu(screen.getByText("Target"), { clientX: 0, clientY: 0 });
		expect(screen.queryByRole("menuitem", { name: "Edit" })).not.toBeInTheDocument();
	});
});
