/**
 * @file useDropdown.test.tsx
 * @brief Behavior tests for the headless `useDropdown` hook.
 *
 * Covers state transitions, prop-getter shapes, ref composition, click-outside
 * handling, keyboard activation, ARIA wiring, and the user-handler-first
 * (Radix-style) merge contract.
 */

import { act, render, renderHook, screen } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useDropdown } from "../useDropdown";

interface Item {
  id: string;
  label: string;
  disabled?: boolean;
}

const ITEMS: readonly Item[] = [
  { id: "a", label: "Apple" },
  { id: "b", label: "Banana", disabled: true },
  { id: "c", label: "Cherry" },
];

const getItemLabel = (item: Item): string => item.label;
const getItemDisabled = (item: Item): boolean => Boolean(item.disabled);

/**
 * Build a synthetic React.MouseEvent that supports the read-after-write
 * `defaultPrevented` semantics we rely on in prop merging. Casting through
 * unknown is the safest narrow path — React's full event class can't be
 * constructed from plain code outside of the synthetic-event pool.
 */
function makeMouseEvent(): React.MouseEvent<HTMLElement> {
  const event = {
    defaultPrevented: false,
    preventDefault(): void {
      event.defaultPrevented = true;
    },
  };
  return event as unknown as React.MouseEvent<HTMLElement>;
}

/** Same as {@link makeMouseEvent} for keyboard events; carries the pressed key. */
function makeKeyboardEvent(key: string): React.KeyboardEvent<HTMLElement> {
  const event = {
    key,
    defaultPrevented: false,
    preventDefault(): void {
      event.defaultPrevented = true;
    },
  };
  return event as unknown as React.KeyboardEvent<HTMLElement>;
}

describe("useDropdown", () => {
  describe("open / close state", () => {
    it("starts closed by default", () => {
      const { result } = renderHook(() => useDropdown<Item>({ items: ITEMS }));
      expect(result.current.isOpen).toBe(false);
    });

    it("respects defaultOpen", () => {
      const { result } = renderHook(() =>
        useDropdown<Item>({ items: ITEMS, defaultOpen: true }),
      );
      expect(result.current.isOpen).toBe(true);
    });

    it("toggle flips between open and closed", () => {
      const { result } = renderHook(() => useDropdown<Item>({ items: ITEMS }));
      act(() => {
        result.current.toggle();
      });
      expect(result.current.isOpen).toBe(true);
      act(() => {
        result.current.toggle();
      });
      expect(result.current.isOpen).toBe(false);
    });

    it("open() and close() are idempotent", () => {
      const onOpenChange = vi.fn();
      const { result } = renderHook(() =>
        useDropdown<Item>({ items: ITEMS, onOpenChange }),
      );
      act(() => {
        result.current.open();
      });
      act(() => {
        result.current.open();
      });
      // Two open() calls but only one transition observed.
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenLastCalledWith(true);

      act(() => {
        result.current.close();
      });
      act(() => {
        result.current.close();
      });
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it("fires onOpenChange on toggle", () => {
      const onOpenChange = vi.fn();
      const { result } = renderHook(() =>
        useDropdown<Item>({ items: ITEMS, onOpenChange }),
      );
      act(() => {
        result.current.toggle();
      });
      expect(onOpenChange).toHaveBeenLastCalledWith(true);
      act(() => {
        result.current.toggle();
      });
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });
  });

  describe("getTriggerProps", () => {
    it("exposes the correct ARIA attributes", () => {
      const { result } = renderHook(() => useDropdown<Item>({ items: ITEMS }));
      const props = result.current.getTriggerProps();
      expect(props["aria-haspopup"]).toBe("menu");
      expect(props["aria-expanded"]).toBe(false);
      expect(props["aria-controls"]).toBe(result.current.contentId);
    });

    it("aria-expanded reflects open state", () => {
      const { result } = renderHook(() =>
        useDropdown<Item>({ items: ITEMS, defaultOpen: true }),
      );
      expect(result.current.getTriggerProps()["aria-expanded"]).toBe(true);
    });

    it("toggles open on click", () => {
      const { result } = renderHook(() => useDropdown<Item>({ items: ITEMS }));
      const click = result.current.getTriggerProps().onClick!;
      act(() => {
        click(makeMouseEvent());
      });
      expect(result.current.isOpen).toBe(true);
    });

    it("respects user-side preventDefault on click", () => {
      const { result } = renderHook(() => useDropdown<Item>({ items: ITEMS }));
      const userOnClick = vi.fn((event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
      });
      const props = result.current.getTriggerProps({ onClick: userOnClick });
      const event = makeMouseEvent();
      act(() => {
        props.onClick!(event);
      });
      expect(userOnClick).toHaveBeenCalledTimes(1);
      expect(result.current.isOpen).toBe(false);
    });

    it("opens on ArrowDown / ArrowUp / Enter / Space", () => {
      const { result, rerender } = renderHook(() =>
        useDropdown<Item>({ items: ITEMS }),
      );
      for (const key of ["ArrowDown", "ArrowUp", "Enter", " "]) {
        const props = result.current.getTriggerProps();
        const event = makeKeyboardEvent(key);
        act(() => {
          props.onKeyDown!(event);
        });
        expect(result.current.isOpen).toBe(true);
        act(() => {
          result.current.close();
        });
        rerender();
      }
    });

    it("composes consumer ref with internal trigger ref", () => {
      const userRef = { current: null as HTMLButtonElement | null };
      function TestComp(): React.JSX.Element {
        const dropdown = useDropdown<Item>({ items: ITEMS });
        const triggerProps = dropdown.getTriggerProps({ ref: userRef });
        return <button type="button" {...triggerProps}>Open</button>;
      }
      render(<TestComp />);
      // Composed callback ref assigns the DOM node to the consumer's ref.
      expect(userRef.current).not.toBeNull();
      expect(userRef.current?.tagName).toBe("BUTTON");
    });
  });

  describe("getContentProps", () => {
    it("exposes role=menu and content id", () => {
      const { result } = renderHook(() =>
        useDropdown<Item>({ items: ITEMS, defaultOpen: true }),
      );
      const props = result.current.getContentProps();
      expect(props.role).toBe("menu");
      expect(props.id).toBe(result.current.contentId);
      expect(props.tabIndex).toBe(-1);
    });

    it("aria-activedescendant tracks focusedIndex", () => {
      const { result, rerender } = renderHook(() =>
        useDropdown<Item>({ items: ITEMS, defaultOpen: true, getItemDisabled }),
      );
      // After open, focus auto-lands on the first enabled item (index 0).
      rerender();
      const props = result.current.getContentProps();
      expect(props["aria-activedescendant"]).toContain("-item-0");
    });
  });

  describe("getItemProps", () => {
    it("returns role=menuitem and a stable id", () => {
      const { result } = renderHook(() => useDropdown<Item>({ items: ITEMS }));
      const props = result.current.getItemProps({ index: 0 });
      expect(props.role).toBe("menuitem");
      expect(props.id).toMatch(/-item-0$/);
    });

    it("invokes onSelect on click and closes by default", () => {
      const onSelect = vi.fn();
      const { result } = renderHook(() =>
        useDropdown<Item>({ items: ITEMS, defaultOpen: true }),
      );
      const props = result.current.getItemProps({ index: 0, onSelect });
      act(() => {
        props.onClick!(makeMouseEvent());
      });
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(result.current.isOpen).toBe(false);
    });

    it("does not close when closeOnSelect is false", () => {
      const onSelect = vi.fn();
      const { result } = renderHook(() =>
        useDropdown<Item>({ items: ITEMS, defaultOpen: true, closeOnSelect: false }),
      );
      const props = result.current.getItemProps({ index: 0, onSelect });
      act(() => {
        props.onClick!(makeMouseEvent());
      });
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(result.current.isOpen).toBe(true);
    });

    it("disabled items skip onSelect and stay open", () => {
      const onSelect = vi.fn();
      const { result } = renderHook(() =>
        useDropdown<Item>({
          items: ITEMS,
          defaultOpen: true,
          getItemDisabled,
        }),
      );
      // Item index 1 (Banana) is disabled.
      const props = result.current.getItemProps({ index: 1, onSelect });
      expect(props["data-disabled"]).toBe("true");
      act(() => {
        props.onClick!(makeMouseEvent());
      });
      expect(onSelect).not.toHaveBeenCalled();
      expect(result.current.isOpen).toBe(true);
    });

    it("respects explicit per-call disabled override", () => {
      const onSelect = vi.fn();
      const { result } = renderHook(() =>
        useDropdown<Item>({ items: ITEMS, defaultOpen: true }),
      );
      const props = result.current.getItemProps({ index: 0, onSelect, disabled: true });
      act(() => {
        props.onClick!(makeMouseEvent());
      });
      expect(onSelect).not.toHaveBeenCalled();
    });

    it("mouseenter focuses the item", () => {
      const { result, rerender } = renderHook(() =>
        useDropdown<Item>({ items: ITEMS, defaultOpen: true, getItemDisabled }),
      );
      const props = result.current.getItemProps({ index: 2 });
      act(() => {
        props.onMouseEnter!(makeMouseEvent());
      });
      rerender();
      expect(result.current.focusedIndex).toBe(2);
    });

    it("user click handler runs before onSelect and can prevent it", () => {
      const onSelect = vi.fn();
      const userOnClick = vi.fn((event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
      });
      const { result } = renderHook(() =>
        useDropdown<Item>({ items: ITEMS, defaultOpen: true }),
      );
      const props = result.current.getItemProps({ index: 0, onSelect, onClick: userOnClick });
      const event = makeMouseEvent();
      act(() => {
        props.onClick!(event);
      });
      expect(userOnClick).toHaveBeenCalledTimes(1);
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe("integration: rendered dropdown", () => {
    function HeadlessDropdown({
      onSelect,
    }: {
      onSelect: (item: Item) => void;
    }): React.JSX.Element {
      const ref = useRef<HTMLButtonElement | null>(null);
      const dropdown = useDropdown<Item>({
        items: ITEMS,
        getItemLabel,
        getItemDisabled,
      });
      return (
        <>
          <button type="button" {...dropdown.getTriggerProps({ ref })}>
            Open menu
          </button>
          {dropdown.isOpen && (
            <ul {...dropdown.getContentProps()}>
              {ITEMS.map((item, i) => (
                <li
                  key={item.id}
                  {...dropdown.getItemProps({
                    index: i,
                    onSelect: () => onSelect(item),
                  })}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          )}
        </>
      );
    }

    it("opens, selects an item, and closes via real DOM click", () => {
      const onSelect = vi.fn();
      render(<HeadlessDropdown onSelect={onSelect} />);

      const trigger = screen.getByRole("button", { name: "Open menu" });
      act(() => {
        trigger.click();
      });
      const menu = screen.getByRole("menu");
      expect(menu).toBeDefined();

      const apple = screen.getByText("Apple");
      act(() => {
        apple.click();
      });
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(ITEMS[0]);
      // Menu has closed.
      expect(screen.queryByRole("menu")).toBeNull();
    });

    it("closes on outside pointerdown", () => {
      render(<HeadlessDropdown onSelect={vi.fn()} />);
      const trigger = screen.getByRole("button", { name: "Open menu" });
      act(() => {
        trigger.click();
      });
      expect(screen.getByRole("menu")).toBeDefined();
      // Synthesize a pointerdown outside both refs by dispatching on document.body.
      act(() => {
        document.body.dispatchEvent(
          new PointerEvent("pointerdown", { bubbles: true }),
        );
      });
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });
});
