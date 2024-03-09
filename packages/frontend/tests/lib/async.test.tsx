import { type JSX } from "react";
import { render, act, fireEvent } from "@testing-library/react";
import { useAsync } from "../../src/lib/async";

async function wait(time: number) {
  return new Promise((res) => {
    setTimeout(res, time);
  });
}

function AsyncComponent(props: { pass: boolean }): JSX.Element {
  const { loading, error, ok } = useAsync<{ time: number }>(() => {
    const time = Math.floor(Math.random() * 1000);
    return wait(time).then(() => {
      if (!props.pass) {
        throw new Error("Failed");
      }
      return { time };
    });
  })
    .catch((err) => <>{err.message}</>)
    .await();

  if (!ok) return (loading ?? error) as JSX.Element;

  return <>Loaded in {ok.time}</>;
}

describe("useAsync hook", () => {
  test("Loading", () => {
    const asyncComponent = render(<AsyncComponent pass={true} />);
    expect(asyncComponent.container).toHaveTextContent(/loading/i);
  });

  test("Ok", async () => {
    const asyncComponent = render(<AsyncComponent pass={true} />);
    expect(asyncComponent.container).toHaveTextContent(/loading/i);

    await act(() => wait(1_010));

    expect(asyncComponent.container).toHaveTextContent(/loaded in/i);
  });

  test("Error", async () => {
    const asyncComponent = render(<AsyncComponent pass={false} />);
    expect(asyncComponent.container).toHaveTextContent(/loading/i);

    await act(() => wait(1_010));

    expect(asyncComponent.container).toHaveTextContent(/failed/i);
  });

  const returnVal = { inner: "Before" };

  test("Refresh Warning", async () => {
    const mockedConsoleWarn = jest.spyOn(console, "warn").mockImplementation();
    let once = false;

    function FailingRefreshComponent() {
      const { loading, error, ok, refresh } = useAsync(() =>
        wait(100).then(() => returnVal),
      )
        .catch(() => void 0)
        .await();

      if (!(ok ?? refresh)) return (loading ?? error) as JSX.Element;

      if (!once) {
        once = true;
        refresh();
      }

      return <>{ok.inner}</>;
    }

    const asyncComponent = render(<FailingRefreshComponent />);
    expect(asyncComponent.container).toHaveTextContent(/loading/i);

    await act(() => wait(600));

    // Expect warning message to be displayed.
    expect(console.warn).toHaveBeenCalled();

    mockedConsoleWarn.mockRestore();
  });

  test("Refresh Valid", async () => {
    const timesCalled = { times: 0 };
    function RefreshingComponent() {
      const { loading, error, ok, refresh } = useAsync(
        () =>
          wait(100).then(() => {
            const before = { times: timesCalled.times };
            timesCalled.times++;
            return before;
          }),
        { refresh: true },
      )
        .loading(() => <>Loading.</>)
        .catch((err) => <>{err.message}</>)
        .await();

      if (!(ok ?? refresh)) return (loading ?? error) as JSX.Element;

      const { times } = ok;
      return (
        <div>
          <span>Clicked {times} times!</span>
          <button onClick={refresh}>Click me</button>
        </div>
      );
    }

    const asyncComponent = render(<RefreshingComponent />);
    expect(asyncComponent.container).toHaveTextContent(/loading/i);

    await act(() => wait(200));
    expect(asyncComponent.container.querySelector("span")).toHaveTextContent(
      /clicked 0 times/i,
    );

    fireEvent.click(
      asyncComponent.container.querySelector(
        "button",
      ) as Element as HTMLButtonElement,
    );

    // We want to keep the old state, until we can be replaced.
    expect(
      asyncComponent.container.querySelector("span"),
    ).not.toHaveTextContent(/loading/i);

    await act(() => wait(200));

    expect(asyncComponent.container.querySelector("span")).toHaveTextContent(
      /clicked 1 times/i,
    );
  });
});
