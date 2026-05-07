/**
 * @file Slot.tsx
 * @brief Minimal slot primitive for the `asChild` prop pattern
 *
 * Lets a component delegate its rendering to whatever child the consumer
 * passes. The classic Radix / Reach pattern: instead of wrapping the
 * consumer's element in a `<div>`, the Slot merges its props (onClick,
 * className, ref, ARIA, etc.) onto the consumer's element directly.
 *
 * Why this exists: keeping the vendored `@octavian-tocan/react-dropdown`
 * package free of `@radix-ui/react-slot` (or the `radix-ui` umbrella)
 * dependency so it can be a true Radix replacement, not a Radix consumer.
 */

"use client";

import { Children, cloneElement, isValidElement, forwardRef } from "react";
import type {
  ReactElement,
  ReactNode,
  Ref,
  RefAttributes,
  HTMLAttributes,
} from "react";

/**
 * @brief Props for the `Slot` component.
 *
 * `Slot` accepts exactly one valid React element as its child. Anything else
 * (zero children, multiple children, a string, a fragment) returns `null`
 * with a dev-time warning rather than throwing — `asChild` consumers tend
 * to drop the prop conditionally and the compiler can't always catch a
 * stray text node.
 */
export type SlotProps = HTMLAttributes<HTMLElement> & {
  /** Single React element to merge props into. */
  children?: ReactNode;
};

/**
 * @brief Merges two `className` strings, dropping empty values.
 *
 * Avoids depending on any `clsx`/`cn` utility so the Slot stays self-contained.
 */
function mergeClassNames(a?: string, b?: string): string | undefined {
  if (!a) return b;
  if (!b) return a;
  return `${a} ${b}`;
}

/**
 * @brief Composes two refs so both the consumer and the Slot can attach
 * their own ref to the same element.
 */
function composeRefs<T>(...refs: Array<Ref<T> | undefined>): Ref<T> {
  return (node: T) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref != null) {
        // React's MutableRefObject .current is read-only by type, but we own
        // the assignment — this is the standard ref-composition escape hatch.
        (ref as { current: T | null }).current = node;
      }
    }
  };
}

/**
 * @brief Composes two event handlers — the Slot's handler runs first, and
 * the child's handler runs after unless the Slot's handler called
 * `event.preventDefault()` (Radix-style ordering).
 */
function composeEventHandlers<E extends { defaultPrevented?: boolean }>(
  slotHandler?: (event: E) => void,
  childHandler?: (event: E) => void,
): ((event: E) => void) | undefined {
  if (!slotHandler && !childHandler) return undefined;
  return (event: E) => {
    slotHandler?.(event);
    if (!event.defaultPrevented) {
      childHandler?.(event);
    }
  };
}

/**
 * @brief Slot — merges its props onto its single child element.
 *
 * Forwards refs so the consumer's ref attaches to the same element that
 * receives the merged props. Handles className concatenation and event
 * handler composition (slot handler first, then child unless prevented).
 *
 * @example
 * ```tsx
 * <Slot onClick={openMenu} aria-haspopup="menu">
 *   <button>Open</button>
 * </Slot>
 * // Renders: <button onClick={openMenu} aria-haspopup="menu">Open</button>
 * ```
 */
export const Slot = forwardRef<HTMLElement, SlotProps>(function Slot(
  { children, ...slotProps },
  forwardedRef,
) {
  const childArray = Children.toArray(children);
  if (childArray.length !== 1 || !isValidElement(childArray[0])) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "Slot expects exactly one valid React element child; got",
        childArray.length,
        "child(ren). Falling back to null. Did you forget to render the trigger inside <DropdownMenuTrigger asChild>?",
      );
    }
    return null;
  }

  const child = childArray[0] as ReactElement<
    HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement>
  >;
  const childProps = child.props;

  // Merge: child's explicit props win on attribute-set basis; the Slot's props
  // augment via class concatenation and event composition. Refs always compose.
  const mergedProps: HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement> = {
    ...slotProps,
    ...childProps,
    className: mergeClassNames(slotProps.className, childProps.className),
    style: { ...slotProps.style, ...childProps.style },
    onClick: composeEventHandlers(slotProps.onClick, childProps.onClick),
    onPointerDown: composeEventHandlers(slotProps.onPointerDown, childProps.onPointerDown),
    onKeyDown: composeEventHandlers(slotProps.onKeyDown, childProps.onKeyDown),
    onFocus: composeEventHandlers(slotProps.onFocus, childProps.onFocus),
    onBlur: composeEventHandlers(slotProps.onBlur, childProps.onBlur),
    ref: composeRefs(
      forwardedRef,
      // React's ref prop is on the element via the special `ref` slot; we read
      // it off the child via the typed RefAttributes intersection above.
      (child as unknown as { ref?: Ref<HTMLElement> }).ref,
    ),
  };

  return cloneElement(child, mergedProps);
});
