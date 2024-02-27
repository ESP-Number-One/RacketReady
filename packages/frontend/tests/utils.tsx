import { type ReactElement, type JSXElementConstructor, useState } from "react";

/**
 * Track the effect of a particular prop on a JSX element.
 * @param _ - The constructor for the JSX element.
 * @returns A special JSX element constructor.
 *
 * @example
 * ```
 * import { fireEvent, render } from "@testing-library/react";
 * import { track } from "./utils";
 * import { Example } from "../src/components/example";
 *
 * const ExampleTracker = track(Example);
 * const component = render(
 *    <ExampleTracker
 *      track="property" // Prop to track.
 *      callback="onPropertyChange" // Function that's called with the prop changes.
 *    >
 *      <Example
 *        property={1} // Initial value for the tracked property.
 *        onPropertyChange={() => void 0} // Placeholder: it will override this.
 *      />
 *    </ExampleTracker>
 * );
 * ```
 */
export function track<Props>(_: JSXElementConstructor<Props>) {
  return function __<
    Tracked extends keyof Props,
    TrackedCallback extends keyof Omit<Props, Tracked>,
  >({
    children,
    track: trackedProp,
    callback: trackedCallback,
  }: {
    children: ReactElement<Props, JSXElementConstructor<Props>>;
    track: Tracked;
    callback: TrackedCallback;
  }) {
    const { [trackedProp]: initial } = children.props;
    const [state, setState] = useState(initial);

    /// @ts-expect-error -- Expecting function components only!!
    const newChild = children.type({
      ...children.props,
      [trackedProp]: state,
      [trackedCallback]: setState,
    }) as ReactElement;

    return <>{newChild}</>;
  };
}
