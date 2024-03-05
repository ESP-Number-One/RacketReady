import { type JSX } from "react";
import { render, act } from "@testing-library/react";
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
});
