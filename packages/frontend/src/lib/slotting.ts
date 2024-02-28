import {
  type ReactElement,
  type ReactNode,
  isValidElement,
  type JSXElementConstructor,
} from "react";
/**
 * ## The Slotting Pattern
 *
 * The slot pattern uses namespaced JSX elements
 * ```jsx
 * <X.Y>Hi, mum!</X.Y>
 * ```
 *
 * to indicate the positioning of its children in the correct place
 * (in the `Y` 'section' or 'slot' of `X`).
 */
// eslint-disable-next-line @typescript-eslint/no-namespace -- I like your style ♪.
export namespace Slot {
  /**
   * Looks through children to find a particular slot.
   * @param children - Children to search through.
   * @param slot - Type of the slot to look out for.
   * @returns The child slot, or `null`.
   *
   * @example
   * ```
   * import { Slot } from "../lib/slotting.js";
   *
   * export function BackButton(): JSX.Element {
   *  // . . . TODO . . .
   * }
   *
   * export function Header({ children }: { children : ReactNode[]; }) {
   *  let backButton = Slot.find(children, BackButton);
   * }
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- No `any` allowed -- bruh.
  export function find<P, Slot extends JSXElementConstructor<any>>(
    fromChildren: ReactNode[],
    slot: Slot,
  ): ReactElement<P, Slot> | undefined {
    return fromChildren.find(
      (child) => isValidElement(child) && child.type === slot,
    ) as ReactElement<P, Slot>;
  }

  /**
   * Ensures an array of children.
   * @param childOrChildren - singular child or multiple children.
   * @returns Array of children.
   */
  export function children(childOrChildren: ReactNode | ReactNode[]) {
    if (childOrChildren instanceof Array) {
      return childOrChildren;
    }

    return [childOrChildren];
  }
}
