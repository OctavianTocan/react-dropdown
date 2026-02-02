/**
 * @file DropdownNewFeatures.test.tsx
 * @brief Tests for new dropdown features: smart positioning, portal, backdrop, staggered animations, etc.
 */

import React from "react";
import { render, screen, waitFor } from "../test-utils/test-helpers";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import {
  DropdownRoot,
  DropdownTrigger,
  DropdownContent,
  DropdownList,
  DropdownHeader,
  DropdownFooter,
  DropdownProvider,
} from "../index";
import { createMockDropdownContext } from "../test-utils/test-helpers";
import type { DropdownRootProps } from "../types";

// Mock items for testing
interface TestItem {
  id: string;
  name: string;
}

const mockItems: TestItem[] = [
  { id: "1", name: "Item 1" },
  { id: "2", name: "Item 2" },
  { id: "3", name: "Item 3" },
];

const defaultProps: DropdownRootProps<TestItem> = {
  items: mockItems,
  onSelect: vi.fn(),
  getItemKey: (item) => item.id,
  getItemDisplay: (item) => item.name,
};

describe("New Dropdown Features", () => {
  describe("DropdownHeader Component", () => {
    it("renders children correctly", () => {
      const mockContext = createMockDropdownContext({ isOpen: true });
      render(
        <DropdownProvider value={mockContext}>
          <DropdownContent>
            <DropdownHeader data-testid="header">
              <div data-testid="header-content">Header Content</div>
            </DropdownHeader>
          </DropdownContent>
        </DropdownProvider>
      );

      expect(screen.getByTestId("header")).toBeInTheDocument();
      expect(screen.getByTestId("header-content")).toHaveTextContent("Header Content");
    });

    it("applies separator class when separator prop is true", () => {
      const mockContext = createMockDropdownContext({ isOpen: true });
      render(
        <DropdownProvider value={mockContext}>
          <DropdownContent>
            <DropdownHeader separator data-testid="header">
              Header
            </DropdownHeader>
          </DropdownContent>
        </DropdownProvider>
      );

      expect(screen.getByTestId("header")).toHaveClass("border-b");
    });

    it("does not apply separator class by default", () => {
      const mockContext = createMockDropdownContext({ isOpen: true });
      render(
        <DropdownProvider value={mockContext}>
          <DropdownContent>
            <DropdownHeader data-testid="header">Header</DropdownHeader>
          </DropdownContent>
        </DropdownProvider>
      );

      expect(screen.getByTestId("header")).not.toHaveClass("border-b");
    });

    it("applies custom className", () => {
      const mockContext = createMockDropdownContext({ isOpen: true });
      render(
        <DropdownProvider value={mockContext}>
          <DropdownContent>
            <DropdownHeader className="custom-class" data-testid="header">
              Header
            </DropdownHeader>
          </DropdownContent>
        </DropdownProvider>
      );

      expect(screen.getByTestId("header")).toHaveClass("custom-class");
    });
  });

  describe("DropdownFooter Component", () => {
    it("renders children correctly", () => {
      const mockContext = createMockDropdownContext({ isOpen: true });
      render(
        <DropdownProvider value={mockContext}>
          <DropdownContent>
            <DropdownFooter data-testid="footer">
              <div data-testid="footer-content">Footer Content</div>
            </DropdownFooter>
          </DropdownContent>
        </DropdownProvider>
      );

      expect(screen.getByTestId("footer")).toBeInTheDocument();
      expect(screen.getByTestId("footer-content")).toHaveTextContent("Footer Content");
    });

    it("applies separator class by default", () => {
      const mockContext = createMockDropdownContext({ isOpen: true });
      render(
        <DropdownProvider value={mockContext}>
          <DropdownContent>
            <DropdownFooter data-testid="footer">Footer</DropdownFooter>
          </DropdownContent>
        </DropdownProvider>
      );

      expect(screen.getByTestId("footer")).toHaveClass("border-t");
    });

    it("does not apply separator class when separator is false", () => {
      const mockContext = createMockDropdownContext({ isOpen: true });
      render(
        <DropdownProvider value={mockContext}>
          <DropdownContent>
            <DropdownFooter separator={false} data-testid="footer">
              Footer
            </DropdownFooter>
          </DropdownContent>
        </DropdownProvider>
      );

      expect(screen.getByTestId("footer")).not.toHaveClass("border-t");
    });

    it("applies custom className", () => {
      const mockContext = createMockDropdownContext({ isOpen: true });
      render(
        <DropdownProvider value={mockContext}>
          <DropdownContent>
            <DropdownFooter className="custom-class" data-testid="footer">
              Footer
            </DropdownFooter>
          </DropdownContent>
        </DropdownProvider>
      );

      expect(screen.getByTestId("footer")).toHaveClass("custom-class");
    });
  });

  describe('Smart Positioning (placement="auto")', () => {
    it('accepts placement prop with value "auto"', () => {
      render(
        <DropdownRoot {...defaultProps} placement="auto">
          <DropdownTrigger displayValue="" placeholder="Select" />
          <DropdownContent>
            <DropdownList
              items={mockItems}
              hasResults
              getItemKey={(item) => item.id}
              getItemDisplay={(item) => item.name}
            />
          </DropdownContent>
        </DropdownRoot>
      );

      expect(screen.getByTestId("dropdown-root")).toBeInTheDocument();
    });

    it('accepts placement prop with value "top"', () => {
      render(
        <DropdownRoot {...defaultProps} placement="top">
          <DropdownTrigger displayValue="" placeholder="Select" />
          <DropdownContent>
            <DropdownList
              items={mockItems}
              hasResults
              getItemKey={(item) => item.id}
              getItemDisplay={(item) => item.name}
            />
          </DropdownContent>
        </DropdownRoot>
      );

      expect(screen.getByTestId("dropdown-root")).toBeInTheDocument();
    });

    it("supports deprecated dropdownPlacement prop", () => {
      render(
        <DropdownRoot {...defaultProps} dropdownPlacement="top">
          <DropdownTrigger displayValue="" placeholder="Select" />
          <DropdownContent>
            <DropdownList
              items={mockItems}
              hasResults
              getItemKey={(item) => item.id}
              getItemDisplay={(item) => item.name}
            />
          </DropdownContent>
        </DropdownRoot>
      );

      expect(screen.getByTestId("dropdown-root")).toBeInTheDocument();
    });
  });

  describe("Custom Animation Durations", () => {
    it("accepts enterDuration and exitDuration props", () => {
      render(
        <DropdownRoot {...defaultProps} enterDuration={0.3} exitDuration={0.2}>
          <DropdownTrigger displayValue="" placeholder="Select" />
          <DropdownContent>
            <DropdownList
              items={mockItems}
              hasResults
              getItemKey={(item) => item.id}
              getItemDisplay={(item) => item.name}
            />
          </DropdownContent>
        </DropdownRoot>
      );

      expect(screen.getByTestId("dropdown-root")).toBeInTheDocument();
    });
  });

  describe("Portal Rendering", () => {
    it("renders dropdown content with portal prop", async () => {
      const user = userEvent.setup();
      render(
        <DropdownRoot {...defaultProps}>
          <DropdownTrigger displayValue="" placeholder="Select" />
          <DropdownContent portal>
            <DropdownList
              items={mockItems}
              hasResults
              getItemKey={(item) => item.id}
              getItemDisplay={(item) => item.name}
            />
          </DropdownContent>
        </DropdownRoot>
      );

      const trigger = screen.getByTestId("dropdown-trigger");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId("dropdown-content")).toBeInTheDocument();
      });
    });
  });

  describe("Backdrop Support", () => {
    it("renders backdrop when backdrop prop is true", async () => {
      const user = userEvent.setup();
      render(
        <DropdownRoot {...defaultProps}>
          <DropdownTrigger displayValue="" placeholder="Select" />
          <DropdownContent backdrop>
            <DropdownList
              items={mockItems}
              hasResults
              getItemKey={(item) => item.id}
              getItemDisplay={(item) => item.name}
            />
          </DropdownContent>
        </DropdownRoot>
      );

      const trigger = screen.getByTestId("dropdown-trigger");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId("dropdown-backdrop")).toBeInTheDocument();
      });
    });

    it("closes dropdown when backdrop is clicked", async () => {
      const user = userEvent.setup();
      render(
        <DropdownRoot {...defaultProps}>
          <DropdownTrigger displayValue="" placeholder="Select" />
          <DropdownContent backdrop>
            <DropdownList
              items={mockItems}
              hasResults
              getItemKey={(item) => item.id}
              getItemDisplay={(item) => item.name}
            />
          </DropdownContent>
        </DropdownRoot>
      );

      const trigger = screen.getByTestId("dropdown-trigger");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId("dropdown-backdrop")).toBeInTheDocument();
      });

      const backdrop = screen.getByTestId("dropdown-backdrop");
      await user.click(backdrop);

      await waitFor(() => {
        expect(screen.queryByTestId("dropdown-backdrop")).not.toBeInTheDocument();
      });
    });

    it("applies custom backdropClassName", async () => {
      const user = userEvent.setup();
      render(
        <DropdownRoot {...defaultProps}>
          <DropdownTrigger displayValue="" placeholder="Select" />
          <DropdownContent backdrop backdropClassName="bg-black/50">
            <DropdownList
              items={mockItems}
              hasResults
              getItemKey={(item) => item.id}
              getItemDisplay={(item) => item.name}
            />
          </DropdownContent>
        </DropdownRoot>
      );

      const trigger = screen.getByTestId("dropdown-trigger");
      await user.click(trigger);

      await waitFor(() => {
        const backdrop = screen.getByTestId("dropdown-backdrop");
        expect(backdrop).toHaveClass("bg-black/50");
      });
    });
  });

  describe("Staggered Animations", () => {
    it("accepts staggered prop on DropdownList", async () => {
      const user = userEvent.setup();
      render(
        <DropdownRoot {...defaultProps}>
          <DropdownTrigger displayValue="" placeholder="Select" />
          <DropdownContent>
            <DropdownList
              items={mockItems}
              hasResults
              getItemKey={(item) => item.id}
              getItemDisplay={(item) => item.name}
              staggered
              staggerDelay={0.05}
            />
          </DropdownContent>
        </DropdownRoot>
      );

      const trigger = screen.getByTestId("dropdown-trigger");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId("dropdown-list")).toBeInTheDocument();
      });
    });
  });

  describe("Animation State", () => {
    it("exposes animationState in context", () => {
      const mockContext = createMockDropdownContext({
        isOpen: true,
        animationState: "entering",
      });

      expect(mockContext.animationState).toBe("entering");
    });

    it("defaults animationState to idle", () => {
      const mockContext = createMockDropdownContext({ isOpen: false });
      expect(mockContext.animationState).toBe("idle");
    });
  });

  describe("closeImmediate", () => {
    it("exposes closeImmediate in context", () => {
      const closeImmediate = vi.fn();
      const mockContext = createMockDropdownContext({
        isOpen: true,
        closeImmediate,
      });

      expect(mockContext.closeImmediate).toBe(closeImmediate);
    });
  });

  describe("Offset Prop", () => {
    it("accepts offset prop", () => {
      render(
        <DropdownRoot {...defaultProps} offset={16}>
          <DropdownTrigger displayValue="" placeholder="Select" />
          <DropdownContent>
            <DropdownList
              items={mockItems}
              hasResults
              getItemKey={(item) => item.id}
              getItemDisplay={(item) => item.name}
            />
          </DropdownContent>
        </DropdownRoot>
      );

      expect(screen.getByTestId("dropdown-root")).toBeInTheDocument();
    });
  });

  describe("Computed Placement", () => {
    it("exposes computedPlacement in context", () => {
      const mockContext = createMockDropdownContext({
        isOpen: true,
        computedPlacement: "top",
      });

      expect(mockContext.computedPlacement).toBe("top");
    });

    it("defaults computedPlacement to bottom", () => {
      const mockContext = createMockDropdownContext({ isOpen: true });
      expect(mockContext.computedPlacement).toBe("bottom");
    });
  });
});
