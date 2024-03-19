import {
  cleanup,
  render,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import * as React from "react";
import { Feed } from "../../../src/components/card/feed";
import { wait } from "../../helpers/utils";
// import { setupMain } from "@testing-library/user-event/dist/cjs/setup/setup.js";

jest.mock(
  "react",
  () =>
    ({
      ...jest.requireActual("react"),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- a
      useRef: jest.fn(jest.requireActual("react").useRef),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- a
      useState: jest.fn(jest.requireActual("react").useState),
    }) as unknown,
);

const specialRef = Object.defineProperty({ current: null }, "current", {
  get() {
    return null;
  },
  set(a) {
    void a;
  },
});
// const useRef = jest.fn().mockReturnValue(specialRef);

// const user = setupMain();

const emptyFn = jest.fn(() => wait(50).then(() => []));
const singleFn = jest.fn(() =>
  wait(50).then(() => [<div key="singleton">Apples</div>]),
);
const singleSectionFn = jest.fn(() =>
  wait(50).then(() => ({ single: [<div key="singleton">Apples</div>] })),
);
const nTimesFn = jest.fn((n: number) => {
  let i = 0;
  return jest.fn(() =>
    wait(50).then(
      () =>
        Array(i++ < n ? 20 : 0)
          .fill(0)
          .map((_, idx) => (
            <div className="test-n" key={`${i}-${idx}`}>
              Apples
            </div>
          )) as React.JSX.Element[],
    ),
  );
});

// const infinite = jest.fn((page: number) => {
//   return wait(50).then(() =>
//     Array(20)
//       .fill(0)
//       .map(
//         (_, i) =>
//           (
//             <div data-page={page} data-i={i} key={`${page}-${i}`} />
//           ) as JSX.Element,
//       ),
//   );
// });

describe("Slotting", () => {
  describe("Defaults", () => {
    test("Loading", async () => {
      const container = await act(() => {
        const feed = render(<Feed nextPage={emptyFn} />);
        return feed.container;
      });

      expect(container.querySelector(".loader")).not.toBeNull();
      expect(container.querySelector(".loader")).toBeInTheDocument();

      cleanup();
    });

    test("Empty", async () => {
      const container = await act(() => {
        const feed = render(<Feed nextPage={emptyFn} />);
        return feed.container;
      });

      await waitFor(() => {
        expect(container).toHaveTextContent("Couldn't find anything.");
      });
    });

    test("End", async () => {
      const container = await act(() => {
        const feed = render(<Feed nextPage={singleFn} />);
        return feed.container;
      });

      await waitFor(() => {
        expect(singleFn).toHaveBeenCalled();
        expect(container).toHaveTextContent("You've reached the end.");
      });
    });
  });

  describe("Customised", () => {
    test("Loading", async () => {
      const container = await act(() => {
        const feed = render(
          <Feed nextPage={emptyFn}>
            <Feed.Loading>Loading!</Feed.Loading>
          </Feed>,
        );

        return feed.container as HTMLDivElement;
      });

      await waitFor(() => {
        expect(container.querySelector(".loader")).toBeNull();
        expect(container).toHaveTextContent(/Loading!/i);
      });
    });

    test("Empty", async () => {
      const container = await act(() => {
        const feed = render(
          <Feed nextPage={emptyFn}>
            <Feed.Empty>Empty!</Feed.Empty>
          </Feed>,
        );

        return feed.container;
      });

      await act(() => wait(100));

      expect(emptyFn).toHaveBeenCalled();
      expect(container).toHaveTextContent("Empty!");
    });

    test("End", async () => {
      const container = await act(() => {
        const feed = render(
          <Feed nextPage={singleFn}>
            <Feed.End>End of the line.</Feed.End>
          </Feed>,
        );

        return feed.container;
      });

      await act(() => wait(100));

      expect(singleFn).toHaveBeenCalled();
      expect(container).toHaveTextContent("End of the line.");
    });

    test("Section (Rendering)", () => {
      const container = render(<Feed.Section section="Apples" />);
      expect(container.container).toBeInTheDocument();
    });

    test("Section", async () => {
      const container = await act(() => {
        const feed = render(
          <Feed nextPage={singleSectionFn} shouldSnap>
            <Feed.Section section="single">Section A</Feed.Section>
          </Feed>,
        );

        return feed.container;
      });

      await act(() => wait(100));

      expect(singleSectionFn).toHaveBeenCalled();
      expect(container).toHaveTextContent("Section A");
      expect(container).toHaveTextContent("Apples");
    });
  });
});
describe("General", () => {
  test("No loading more", async () => {
    const twice = nTimesFn(2);

    const container = await act(() => {
      const feed = render(
        <Feed nextPage={twice}>
          <Feed.End>End of the line.</Feed.End>
        </Feed>,
      );
      return feed.container;
    });

    await act(() => wait(100));

    expect(twice).toHaveBeenCalled();
    expect(container.querySelector(".test-n")).toBeInTheDocument();
    expect(container.querySelectorAll(".test-n").length).toBe(20);
  });

  test("Scroll to load", async () => {
    const twice = nTimesFn(2);

    const container = await act(() => {
      const feed = render(
        <Feed nextPage={twice}>
          <Feed.End>End of the line.</Feed.End>
        </Feed>,
      );

      return feed.container as HTMLDivElement;
    });

    const scroller = container.childNodes[0] as HTMLDivElement;

    // Attempt to scroll while waiting for state to change.
    act(() => {
      fireEvent.scroll(scroller, {
        target: {
          scrollTop: -10,
        },
      });
      expect(twice).toHaveBeenCalledTimes(1);
    });

    await act(() => wait(100));
    expect(twice).toHaveBeenCalledTimes(1);

    // Not enough.
    act(() => {
      fireEvent.scroll(scroller, {
        target: {
          scrollTop: -10,
        },
      });
    });

    expect(twice).toHaveBeenCalledTimes(1);

    // Scroll to load.
    act(() => {
      fireEvent.scroll(scroller, {
        target: {
          scrollTop: scroller.scrollHeight - scroller.clientHeight + 29,
        },
      });
    });

    await act(() => wait(100));

    expect(twice).toHaveBeenCalledTimes(2);
    // console.log(prettyDOM(scroller));
  });

  const partialTouch = (p: Partial<Touch>) => {
    return p as unknown as Touch;
  };

  test("Pull down to refresh", async () => {
    const twice = nTimesFn(2);

    const container = await act(() => {
      const feed = render(
        <Feed nextPage={twice}>
          <Feed.End>End of the line.</Feed.End>
        </Feed>,
      );

      return feed.container as HTMLDivElement;
    });

    const scroller = container.childNodes[0] as HTMLDivElement;

    // First page loaded.
    await act(() => wait(100));
    expect(twice).toHaveBeenCalledTimes(1);
    expect(twice).toHaveBeenLastCalledWith(0);

    // Try to refresh.

    expect(scroller.childNodes[0]).toHaveStyle({ top: "-70px" });

    // Dud move.
    act(() => {
      fireEvent.touchStart(scroller);
      scroller.scrollTop = 1;

      fireEvent.touchMove(scroller, {
        targetTouches: [],
      });
      fireEvent.touchEnd(scroller);
      scroller.scrollTop = 0;
    });

    // Another dud move.
    act(() => {
      fireEvent.touchStart(scroller);
      fireEvent.touchMove(scroller, {
        targetTouches: [],
      });
      fireEvent.touchEnd(scroller);
    });

    // Scrolls down.
    act(() => {
      fireEvent.touchStart(scroller);
      scroller.scrollTop = 1;
      fireEvent.touchEnd(scroller);
      scroller.scrollTop = 0;
    });

    // Scrolls down, but different events.
    act(() => {
      fireEvent.touchStart(scroller);
      fireEvent.touchMove(scroller, {
        targetTouches: [partialTouch({ clientY: 1 })],
      });
      fireEvent.touchMove(scroller, {
        targetTouches: [partialTouch({ clientY: -100 })],
      });
      fireEvent.touchEnd(scroller);
      scroller.scrollTop = 0;
    });

    // First move.
    act(() => {
      fireEvent.touchStart(scroller);
      fireEvent.touchMove(scroller, {
        targetTouches: [partialTouch({ clientY: 1 })],
      });
    });

    // Second move.
    act(() => {
      fireEvent.touchMove(scroller, {
        targetTouches: [partialTouch({ clientY: 51 })],
      });
    });
    //

    // Over threshold.
    act(() => {
      fireEvent.touchMove(scroller, {
        targetTouches: [partialTouch({ clientY: 91 })],
      });
    });

    // Expect the refresh icon to have moved.
    expect(scroller.childNodes[0]).not.toHaveStyle({ top: "-70px" });

    // Let go -- expect a refresh.
    act(() => {
      fireEvent.touchEnd(scroller);
    });

    await act(() => wait(100));

    expect(twice).toHaveBeenCalledTimes(2);
    expect(twice).toHaveBeenLastCalledWith(0);
  });
});

describe("React failures", () => {
  test("Failing useRef", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access -- s
    (React.useRef as any).mockReturnValue(specialRef);

    const container = await act(() => {
      const feed = render(
        <Feed nextPage={nTimesFn(2)}>
          <Feed.End>End of the line.</Feed.End>
        </Feed>,
      );

      return feed.container;
    });

    const scroller = container.childNodes[0] as HTMLDivElement;

    // Broken scroll.
    act(() => {
      fireEvent.scroll(scroller, {
        target: {
          scrollTop: -10,
        },
      });
    });

    // Broken touch events
    act(() => {
      act(() => {
        fireEvent.touchStart(scroller);
        scroller.scrollTop = 1;

        fireEvent.touchMove(scroller, {
          targetTouches: [],
        });
        fireEvent.touchEnd(scroller);
        scroller.scrollTop = 0;
      });
    });
  });

  test("Failing useState", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access -- Evil trick.
    (React.useRef as any).mockImplementation((v: unknown) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- EVIL
      jest.fn(jest.requireActual("react").useRef)(v),
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any -- EVIL
    (React.useState as any).mockImplementation((v: unknown) => {
      if (typeof v === "number" && v === 1) {
        return [v, (a: number) => void a];
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- Bruh
      return jest.requireActual("react").useState(v);
    }); // Always LOADING.

    const container = await act(() => {
      const feed = render(
        <Feed nextPage={nTimesFn(2)}>
          <Feed.End>End of the line.</Feed.End>
        </Feed>,
      );

      return feed.container;
    });

    const scroller = container.childNodes[0] as HTMLDivElement;

    act(() => {
      fireEvent.scroll(scroller, {
        target: {
          scrollTop: scroller.scrollHeight - scroller.clientHeight + 29,
        },
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access -- s
    (React.useState as any).mockReset();
  });
});
