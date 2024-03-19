/* eslint-disable -- This is fine */

/**
 *
 * ## mockLibrary
 *
 * Allows you to mock specific functions in a library namespace.
 *
 * By default, all of these functions use their original
 * implementation.
 *
 * @param module - The module path.
 * @param _namespace - The namespace itself.
 * @param keys - The functions you wish to mock.
 * @returns The mocked functions (in an object).
 *
 * @example
 * ```tsx
 * import * as ReactRouterDOM from "react-router-dom";
 * const { useParams } = mockLibrary(
 *    "react-router-dom",
 *    ReactRouterDOM,
 *    ["useParams"],
 * );
 * ```
 */
export function fakeLibrary<Lib, Keys extends (keyof FunctionsOf<Lib>)[]>(
  module: string,
  _namespace: Lib,
  keys: Keys,
) {
  const lib = jest.requireActual(module) as Lib;

  const ret = Object.fromEntries(
    keys.map((key) => [key, jest.fn()]),
  ) as MockSelection<Lib, Keys>;

  Object.entries(ret).forEach(([key, fn]) => {
    (fn as any).mockImplementation((lib as any)[key]);
  });

  jest.mock(module, () => ({
    ...lib,
    ...ret,
  }));

  return ret;
}

export type MockSelection<Lib, Keys extends Readonly<(keyof Lib)[]>> = {
  [K in Keys[number]]: Lib[K] extends (...args: any[]) => any
    ? jest.Mock<
        ReturnType<Lib[K]>,
        Parameters<Lib[K]>,
        ThisParameterType<Lib[K]>
      >
    : never;
};

export type FunctionsOf<Lib> = {
  [K in keyof Lib as Lib[K] extends (...args: any[]) => any
    ? K
    : never]: Lib[K];
};

const ROUTING_FUNCTIONS = [
  "useParams",
  "redirect",
  "useNavigate",
  "useLocation",
] as const;

export const mockRouting = async () => {
  const mocked = await import("react-router-dom");
  return Object.fromEntries(
    ROUTING_FUNCTIONS.map((k) => [k, mocked[k]]),
  ) as MockSelection<
    typeof import("react-router-dom"),
    typeof ROUTING_FUNCTIONS
  >;
};

const REACT_FUNCTIONS = ["useState", "useRef"] as const;

export const mockReact = async () => {
  const mocked = await import("react");
  return Object.fromEntries(
    REACT_FUNCTIONS.map((k) => [k, mocked[k]]),
  ) as MockSelection<typeof import("react"), typeof REACT_FUNCTIONS>;
};
