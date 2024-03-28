import { render } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { App } from "../src/app";
import { mockRouting } from "./__meta__";

const navFn = jest.fn();

test("Not Logged in", async () => {
  const { useNavigate, useLocation } = await mockRouting();
  useNavigate.mockReturnValue(navFn);
  useLocation.mockReturnValue({
    key: "Apple",
    state: {},
    pathname: "/",
    search: "",
    hash: "",
  });

  const comp = render(<App />);
  await act(() => Promise.resolve());

  expect(comp.container).toHaveTextContent(/log in/i);
});
