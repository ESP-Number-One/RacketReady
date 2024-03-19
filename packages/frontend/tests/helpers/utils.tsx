import { type ReactElement, type JSXElementConstructor, useState } from "react";
import { type APIClient } from "@esp-group-one/api-client";
import type { SubAPIClient } from "@esp-group-one/api-client/build/src/sub/base";
import { API } from "../../src/state/auth";
import { ErrorHandler } from "../../src/lib/async";

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

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Define a partial implmentation of a type,
 * then pretend it's the full type.
 *
 * @typeParam T - The type in question.
 */
export function partiallyImpl<T>(a: DeepPartial<T>): T {
  return a as unknown as T;
}

type Partialize<T> = T extends SubAPIClient<unknown, unknown, unknown, unknown>
  ? { [K in keyof T]?: T[K] }
  : T extends (...args: infer P) => infer R
    ? (...args: P) => Partialize<R>
    : T extends object
      ? { [K in keyof T]?: Partialize<T[K]> }
      : T;

/**
 * ## Client API Mocking
 *
 * Allows you to test your API-dependent components,
 * with sensible fake data.
 *
 * @example
 * ```tsx
 * import { render } from "@testing-library/react";
 * import { MockAPI } from "./utils";
 * import { Example } from "../src/components/example";
 *
 * describe("Example", () => {
 *  const MockedAPI = MockAPI({
 *    user() {
 *      return {
 *        me: () => Promise.resolve({ _id: "1", name: "Bot1", ... }),
 *      }
 *    }
 *  });
 *
 *  test("Render", () => {
 *    const component = render(
 *      <MockedAPI>
 *        <Example />
 *      </MockedAPI>
 *    );
 *
 *    expect(component.container).toHaveTextContent("Hello, world!");
 *  });
 * });
 * ```
 */
export function MockAPI(api: Partialize<APIClient>) {
  return function __({ children }: { children: ReactElement }) {
    return (
      <API.Provider value={api as unknown as APIClient}>
        {children}
      </API.Provider>
    );
  };
}

export function MockErrorHandler(fn: (e: Error) => void) {
  return function __({ children }: { children: ReactElement }) {
    return <ErrorHandler.Provider value={fn}>{children}</ErrorHandler.Provider>;
  };
}

export function wait(ms: number) {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
}
