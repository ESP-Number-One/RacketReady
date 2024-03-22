import { cleanup, getByText, render } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCake } from "@fortawesome/free-solid-svg-icons";
import { RadioButton } from "../../../src/components/form/radio_button";

afterAll(cleanup);

describe("Radio button", () => {
  describe("is first", () => {
    test("Corners", () => {
      const value = "MyValue";

      const component = render(<RadioButton value={value} isFirst checked />);

      expect(component.container).toBeInTheDocument();

      const buttonDiv = component.container.children[0];
      expect(buttonDiv.children.length).toBe(1);
      expect(buttonDiv.classList.contains("rounded-l-lg")).toBe(true);
      expect(buttonDiv.classList.contains("rounded-r-lg")).toBe(false);
    });

    testOptions({ isFirst: true });
  });

  describe("is middle", () => {
    test("Corners", () => {
      const value = "MyValue";

      const component = render(<RadioButton value={value} checked />);

      expect(component.container).toBeInTheDocument();

      const buttonDiv = component.container.children[0];
      expect(buttonDiv.children.length).toBe(1);
      expect(buttonDiv.classList.contains("rounded-l-lg")).toBe(false);
      expect(buttonDiv.classList.contains("rounded-r-lg")).toBe(false);
    });

    testOptions({});
  });

  describe("is last", () => {
    test("Corners", () => {
      const value = "MyValue";

      const component = render(<RadioButton value={value} isLast checked />);

      expect(component.container).toBeInTheDocument();

      const buttonDiv = component.container.children[0];
      expect(buttonDiv.children.length).toBe(1);
      expect(buttonDiv.classList.contains("rounded-l-lg")).toBe(false);
      expect(buttonDiv.classList.contains("rounded-r-lg")).toBe(true);
    });

    testOptions({ isFirst: true });
  });

  describe("is both", () => {
    test("Corners", () => {
      const value = "MyValue";

      const component = render(
        <RadioButton value={value} isFirst isLast checked />,
      );

      expect(component.container).toBeInTheDocument();

      const buttonDiv = component.container.children[0];
      expect(buttonDiv.children.length).toBe(1);
      expect(buttonDiv.classList.contains("rounded-l-lg")).toBe(true);
      expect(buttonDiv.classList.contains("rounded-r-lg")).toBe(true);
    });

    testOptions({ isFirst: true });
  });
});

function testOptions(props: { isFirst?: boolean; isLast?: boolean }) {
  test("Clicking", async () => {
    const user = userEvent.setup();
    const value = "MyValue";

    let called = 0;
    const onChange = (myVal: boolean) => {
      called++;
      expect(myVal).toBe(true);
    };

    const component = render(
      <RadioButton value={value} {...props} onChange={onChange} />,
    );

    expect(component.container).toBeInTheDocument();

    const buttonDiv = component.container.children[0];
    expect(buttonDiv.children.length).toBe(1);

    const button = buttonDiv.querySelector("input");
    expect(button).not.toBeNull();

    expect(called).toBe(0);
    if (button) await user.click(button);
    expect(called).toBe(1);
  });

  test("Checked", async () => {
    const user = userEvent.setup();
    const value = "MyValue";

    const component = render(<RadioButton value={value} {...props} checked />);

    expect(component.container).toBeInTheDocument();

    const buttonDiv = component.container.children[0];
    expect(buttonDiv.children.length).toBe(1);
    expect(buttonDiv.classList.contains("bg-p-green-100")).toBe(true);

    const button = buttonDiv.querySelector("input");
    expect(button).not.toBeNull();

    if (button) await user.click(button);
  });

  test("with label", () => {
    const value = "MyValue";
    const label = "MyLabel";

    const component = render(
      <RadioButton value={value} label={label} {...props} />,
    );

    expect(component.container).toBeInTheDocument();

    const buttonDiv = component.container.children[0];
    expect(buttonDiv.children.length).toBe(1);
    expect(getByText(component.container, label)).not.toBeNull();
  });

  test("with icon", async () => {
    const user = userEvent.setup();
    const value = "MyValue";

    const component = render(
      <RadioButton
        value={value}
        {...props}
        icon={<FontAwesomeIcon icon={faCake} />}
      />,
    );

    expect(component.container).toBeInTheDocument();

    const buttonDiv = component.container.children[0];
    expect(buttonDiv.children.length).toBe(2);

    const button = buttonDiv.querySelector("input");
    expect(button).not.toBeNull();

    if (button) await user.click(button);
  });
}
