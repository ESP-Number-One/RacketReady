import { cleanup, render } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCake } from "@fortawesome/free-solid-svg-icons";
import { Input } from "../../../src/components/form/input";

afterAll(cleanup);

describe("Input", () => {
  describe("text", () => {
    test("General", () => {
      const component = render(<Input type="text" value="Hi" />);

      expect(component.container).toBeInTheDocument();

      const inputDiv = component.container.children[0];
      expect(inputDiv.children.length).toBe(1);

      const input = inputDiv.children[0] as HTMLInputElement;
      expect(input.type).toBe("text");

      expect(inputDiv.querySelector("input")).not.toBeNull();
    });

    testOther("text");
  });

  describe("email", () => {
    test("General", () => {
      const component = render(<Input type="email" value="Hi" />);

      expect(component.container).toBeInTheDocument();

      const inputDiv = component.container.children[0];
      expect(inputDiv.children.length).toBe(1);

      const input = inputDiv.children[0] as HTMLInputElement;
      expect(input.type).toBe("email");

      expect(inputDiv.querySelector("input")).not.toBeNull();
    });

    testOther("email");
  });

  describe("textarea", () => {
    test("General", () => {
      const component = render(<Input type="textarea" value="Hi" />);

      expect(component.container).toBeInTheDocument();

      const inputDiv = component.container.children[0];
      expect(inputDiv.children.length).toBe(1);

      expect(inputDiv.querySelector("textarea")).not.toBeNull();
    });

    testOther("textarea");
  });

  describe("date", () => {
    test("General", () => {
      const component = render(<Input type="date" value="Hi" />);

      expect(component.container).toBeInTheDocument();

      const inputDiv = component.container.children[0];
      expect(inputDiv.children.length).toBe(1);

      const input = inputDiv.children[0] as HTMLInputElement;
      expect(input.type).toBe("date");

      expect(inputDiv.querySelector("input")).not.toBeNull();
    });

    testOther("date");
  });

  describe("time", () => {
    test("General", () => {
      const component = render(<Input type="time" value="Hi" />);

      expect(component.container).toBeInTheDocument();

      const inputDiv = component.container.children[0];
      expect(inputDiv.children.length).toBe(1);

      const input = inputDiv.children[0] as HTMLInputElement;
      expect(input.type).toBe("time");

      expect(inputDiv.querySelector("input")).not.toBeNull();
    });

    testOther("time");
  });

  test("default onChange doesn't crash", async () => {
    const user = userEvent.setup();

    const component = render(<Input type="text" value="Hi" />);

    expect(component.container).toBeInTheDocument();

    const inputDiv = component.container.children[0];
    expect(inputDiv.children.length).toBe(1);

    const input = inputDiv.querySelector("input");
    expect(input).not.toBeNull();
    if (input) await expect(user.type(input, "y")).resolves.not.toThrow();
  });
});

function testOther(type: "text" | "email" | "textarea" | "time" | "date") {
  test("with updating", async () => {
    const user = userEvent.setup();

    const onChange = (res: string) => {
      expect(res).toBe("Hey");
    };

    const component = render(
      <Input type={type} value="He" onChange={onChange} />,
    );

    expect(component.container).toBeInTheDocument();

    const input = component.container.children[0].children[0];

    await user.type(input, "y");
  });

  test("required", () => {
    const onChange = (res: string) => {
      expect(res).toBe("Hi there");
    };

    const component = render(
      <Input type={type} value="Hi" onChange={onChange} required />,
    );

    expect(component.container).toBeInTheDocument();

    const input = component.container.children[0]
      .children[0] as HTMLInputElement;
    expect(input.required).toBe(true);
    expect(input.disabled).toBe(false);
  });

  test("disabled", () => {
    const onChange = (res: string) => {
      expect(res).toBe("Hi there");
    };

    const component = render(
      <Input type={type} value="Hi" onChange={onChange} disabled />,
    );

    expect(component.container).toBeInTheDocument();

    const input = component.container.children[0]
      .children[0] as HTMLInputElement;
    expect(input.required).toBe(false);
    expect(input.disabled).toBe(true);
  });

  test("placeholder", () => {
    const onChange = (res: string) => {
      expect(res).toBe("Hi there");
    };

    const component = render(
      <Input
        type={type}
        value="Hi"
        onChange={onChange}
        placeholder="Hi there"
      />,
    );

    expect(component.container).toBeInTheDocument();

    const input = component.container.children[0]
      .children[0] as HTMLInputElement;
    expect(input.placeholder).toBe("Hi there");
  });

  test("with icon", () => {
    const component = render(
      <Input type={type} icon={<FontAwesomeIcon icon={faCake} />} value="Hi" />,
    );

    expect(component.container).toBeInTheDocument();

    const inputDiv = component.container.children[0];
    expect(inputDiv.children.length).toBe(2);
  });
}
