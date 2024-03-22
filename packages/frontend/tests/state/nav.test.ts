import type { NavigateFunction, NavigateOptions, To } from "react-router-dom";
import { mockRouting } from "../__meta__";
import { useViewNav } from "../../src/state/nav";

describe("useViewNav", () => {
  describe("Forwards", () => {
    test("First", async () => {
      const Routing = await mockRouting();

      Routing.useLocation.mockReturnValue({
        state: undefined,
        key: "0",
        pathname: "/curr",
        search: "",
        hash: "",
      });

      Routing.useNavigate.mockImplementation((): NavigateFunction => {
        const res = (location: To, options?: NavigateOptions) => {
          expect(location).toBe("/link");
          expect(options).toStrictEqual({ state: { from: ["/curr"] } });
        };
        return res as NavigateFunction;
      });

      const viewNav = useViewNav();
      viewNav("/link");
    });

    test("Normal", async () => {
      const Routing = await mockRouting();

      Routing.useLocation.mockReturnValue({
        state: { from: ["/previous"] },
        key: "0",
        pathname: "/curr",
        search: "",
        hash: "",
      });

      Routing.useNavigate.mockImplementation((): NavigateFunction => {
        const res = (location: To, options?: NavigateOptions) => {
          expect(location).toBe("/link");
          expect(options).toStrictEqual({
            state: { from: ["/previous", "/curr"] },
          });
        };
        return res as NavigateFunction;
      });

      const viewNav = useViewNav();
      viewNav("/link");
    });

    test("Long history", async () => {
      const Routing = await mockRouting();

      Routing.useLocation.mockReturnValue({
        state: {
          from: [
            "/one",
            "/two",
            "/three",
            "/four",
            "/five",
            "/six",
            "/seven",
            "/eight",
            "/nine",
            "/ten",
            "/eleven",
          ],
        },
        key: "0",
        pathname: "/curr",
        search: "",
        hash: "",
      });

      Routing.useNavigate.mockImplementation((): NavigateFunction => {
        const res = (location: To, options?: NavigateOptions) => {
          expect(location).toBe("/link");
          expect(options).toStrictEqual({
            state: {
              from: [
                "/two",
                "/three",
                "/four",
                "/five",
                "/six",
                "/seven",
                "/eight",
                "/nine",
                "/ten",
                "/eleven",
                "/curr",
              ],
            },
          });
        };
        return res as NavigateFunction;
      });

      const viewNav = useViewNav();
      viewNav("/link");
    });
  });

  describe("Backwards", () => {
    test("First", async () => {
      const Routing = await mockRouting();

      Routing.useLocation.mockReturnValue({
        state: undefined,
        key: "0",
        pathname: "/curr",
        search: "",
        hash: "",
      });

      Routing.useNavigate.mockImplementation((): NavigateFunction => {
        const res = (location: To, options?: NavigateOptions) => {
          expect(location).toBe("/link");
          expect(options).toStrictEqual({ state: { from: [] } });
        };
        return res as NavigateFunction;
      });

      const viewNav = useViewNav();
      viewNav("/link", true);
    });

    test("Normal", async () => {
      const Routing = await mockRouting();

      Routing.useLocation.mockReturnValue({
        state: { from: ["/previous"] },
        key: "0",
        pathname: "/curr",
        search: "",
        hash: "",
      });

      Routing.useNavigate.mockImplementation((): NavigateFunction => {
        const res = (location: To, options?: NavigateOptions) => {
          expect(location).toBe("/link");
          expect(options).toStrictEqual({ state: { from: [] } });
        };
        return res as NavigateFunction;
      });

      const viewNav = useViewNav();
      viewNav("/link", true);
    });
  });

  test("with transition", async () => {
    let func: (() => void) | undefined;
    (
      document as unknown as { startViewTransition?: unknown }
    ).startViewTransition = (thisFunc: () => void) => {
      func = thisFunc;
    };

    const Routing = await mockRouting();

    Routing.useLocation.mockReturnValue({
      state: { from: ["/previous"] },
      key: "0",
      pathname: "/curr",
      search: "",
      hash: "",
    });

    let called = 0;

    Routing.useNavigate.mockImplementation((): NavigateFunction => {
      const res = (location: To, options?: NavigateOptions) => {
        expect(location).toBe("/link");
        expect(options).toStrictEqual({
          state: { from: ["/previous", "/curr"] },
        });
        called++;
      };
      return res as NavigateFunction;
    });

    const viewNav = useViewNav();
    viewNav("/link");

    expect(called).toBe(0);
    expect(func).not.toBeUndefined();
    if (func) func();
    expect(called).toBe(1);
  });
});
