import { cleanup, fireEvent, render } from "@testing-library/react";
import { Search } from "../src/components/search";

afterEach(cleanup);

it("renders without crashing", () => {
  const onSubmit: jest.Mock = jest.fn();
  render(<Search onSubmit={onSubmit} />);
  render(<Search onSubmit={onSubmit} hidden={false} />);
  render(<Search onSubmit={onSubmit} hidden={true} />);
});

it("rejects empty input", () => {
  const onSubmit: jest.Mock = jest.fn();
  const { getByTestId } = render(<Search onSubmit={onSubmit} />);
  fireEvent.click(getByTestId("search-button"));
  expect(onSubmit.mock.calls.length).toBe(0);
});

it("calls submit once on clicking button with nonempty input", () => {
  const onSubmit: jest.Mock = jest.fn();
  const { getByTestId } = render(<Search onSubmit={onSubmit} />);

  fireEvent.change(getByTestId("search-input"), { target: { value: "ABC" } });
  fireEvent.click(getByTestId("search-button"));
  expect(onSubmit.mock.calls.length).toBe(1);
  expect(onSubmit.mock.calls[0]).toContain("ABC");
});

it("calls submit once on releashing enter key with nonempty input", () => {
  const onSubmit: jest.Mock = jest.fn();
  const { getByTestId } = render(<Search onSubmit={onSubmit} />);

  fireEvent.change(getByTestId("search-input"), { target: { value: "ABC" } });
  fireEvent.keyUp(getByTestId("search-input"), { key: "Enter", code: "Enter" });
  expect(onSubmit.mock.calls.length).toBe(1);
  expect(onSubmit.mock.calls[0]).toContain("ABC");
});
