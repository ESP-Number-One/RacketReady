import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

test("Test message", () => {
  expect(3).toBe(3);
  const testMessage = "Test Message";
  render(<>{testMessage}</>);

  // query* functions will return the element or null if it cannot be found
  // get* functions will return the element or throw an error if it cannot be found

  const div = screen.queryByText(testMessage);
  expect(div).toBeInTheDocument();
  expect(div).toHaveTextContent(testMessage);
});
