import { cleanup, getByText, render } from "@testing-library/react";
import { ErrorDiv } from "../../src/components/error";

afterAll(cleanup);

describe("error div", () => {
  test("no error", () => {
    const component = render(<ErrorDiv error={""} />);
    expect(component.container).toBeInTheDocument();
    expect(component.container.children.length).toBe(0);
  });

  test("some error", () => {
    const error = "Some error";
    const component = render(<ErrorDiv error={error} />);
    expect(component.container).toBeInTheDocument();
    expect(component.container.children.length).toBe(1);

    const t = getByText(component.container, error);
    expect(t).not.toBeNull();
    expect(t.classList.contains("font-medium")).toBe(true);
  });

  test("custom class", () => {
    const error = "Some error";
    const component = render(<ErrorDiv error={error} className="yoo" />);
    expect(component.container).toBeInTheDocument();
    expect(component.container.children.length).toBe(1);
    expect(component.container.children[0].classList.contains("yoo")).toBe(
      true,
    );
  });
});
