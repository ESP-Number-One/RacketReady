import { cleanup, getByText, render } from "@testing-library/react";
import { Message } from "../../src/components/message";

afterAll(cleanup);

describe("message", () => {
  test("incoming", () => {
    const message = "Hi";
    const component = render(<Message message={message} isIncoming={true} />);
    expect(component.container).toBeInTheDocument();
    const m = getByText(component.container, message);
    expect(m).not.toBeNull();
    expect(m.classList.contains("bg-p-grey-100")).toBe(true);
    expect(m.classList.contains("bg-p-blue")).toBe(false);
  });

  test("outgoing", () => {
    const message = "Hi";
    const component = render(<Message message={message} isIncoming={false} />);
    expect(component.container).toBeInTheDocument();
    const m = getByText(component.container, message);
    expect(m).not.toBeNull();
    expect(m.classList.contains("bg-p-grey-100")).toBe(false);
    expect(m.classList.contains("bg-p-blue")).toBe(true);
  });
});
