import { cleanup, render } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { faCake } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "../../src/components/button";

afterAll(cleanup);

describe("button", () => {
  test("clicking", async () => {
    const user = userEvent.setup();
    let called = 0;
    const component = render(
      <Button
        onClick={() => {
          called++;
        }}
      />,
    );

    expect(component.container).toBeInTheDocument();

    const button = component.container.children[0] as HTMLButtonElement;
    expect(button).not.toBeNull();

    expect(called).toBe(0);
    expect(button.classList.contains("transform")).toBe(true);
    expect(button.classList.contains("justify-center")).toBe(true);

    await user.click(button);
    expect(called).toBe(1);
  });

  describe("correct border radius", () => {
    let next: CornerOpts | undefined;

    for (let i = 0; (next = cornerBuilder(i)); i++) {
      const myNext = { ...next };
      test(Object.keys(myNext).join(" "), () => {
        const component = render(<Button roundedCorners={myNext} />);

        expect(component.container).toBeInTheDocument();
        const button = component.container.children[0];
        expect(button).not.toBeNull();

        expect(button.classList.contains("rounded-tl-lg")).toBe(
          myNext.topLeft !== false,
        );

        expect(button.classList.contains("rounded-tr-lg")).toBe(
          myNext.topRight !== false,
        );

        expect(button.classList.contains("rounded-bl-lg")).toBe(
          myNext.bottomLeft !== false,
        );

        expect(button.classList.contains("rounded-br-lg")).toBe(
          myNext.bottomRight !== false,
        );
      });
    }
  });

  test("with icon", () => {
    const icon = <FontAwesomeIcon icon={faCake} />;
    const component = render(<Button icon={icon} />);

    expect(component.container).toBeInTheDocument();
    expect(
      component.container.querySelector("span.align-middle"),
    ).not.toBeNull();

    const button = component.container.children[0] as HTMLButtonElement;
    expect(button).not.toBeNull();

    expect(button.classList.contains("transform")).toBe(true);
    expect(button.classList.contains("justify-start")).toBe(true);
    expect(button.classList.contains("justify-center")).toBe(false);
  });

  test("default click button", async () => {
    const user = userEvent.setup();
    const component = render(<Button />);

    expect(component.container).toBeInTheDocument();

    const button = component.container.children[0] as HTMLButtonElement;
    expect(button).not.toBeNull();
    await expect(user.click(button)).resolves.not.toThrow();
  });

  test("disabled", () => {
    const component = render(<Button disabled />);

    expect(component.container).toBeInTheDocument();

    const button = component.container.children[0] as HTMLButtonElement;
    expect(button).not.toBeNull();

    expect(button.classList.contains("transform")).toBe(false);
    expect(button.classList.contains("justify-center")).toBe(true);
  });
});

interface CornerOpts {
  bottomLeft?: boolean;
  bottomRight?: boolean;
  topLeft?: boolean;
  topRight?: boolean;
}

function cornerBuilder(
  index: number,
  potentialValues: (boolean | undefined)[] = [true, false, undefined],
  keys: ("bottomLeft" | "bottomRight" | "topLeft" | "topRight")[] = [
    "bottomLeft",
    "bottomRight",
    "topLeft",
    "topRight",
  ],
): CornerOpts | undefined {
  if (index > Math.pow(potentialValues.length, keys.length)) return undefined;

  const prev =
    keys.length > 1
      ? cornerBuilder(
          Math.floor(index / potentialValues.length),
          potentialValues,
          keys.slice(1),
        )
      : {};

  const i = index % potentialValues.length;
  const value = potentialValues[i];

  if (prev && value !== undefined) {
    prev[keys[0]] = value;
  }

  return prev;
}
