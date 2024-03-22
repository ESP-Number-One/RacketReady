import { cleanup, render } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import * as auth0 from "@auth0/auth0-react";
import { LoginButton, LogoutButton } from "../../src/components/auth";

afterAll(cleanup);
jest.mock("@auth0/auth0-react");

describe("login", () => {
  test("Pressing", async () => {
    const user = userEvent.setup();

    let called = 0;
    const mock = jest.spyOn(auth0, "useAuth0").mockImplementation(
      () =>
        ({
          loginWithRedirect: () => {
            called++;
            return Promise.resolve();
          },
        }) as auth0.Auth0ContextInterface,
    );

    const component = render(<LoginButton />);
    expect(component.container).toBeInTheDocument();
    expect(mock).toHaveBeenCalledTimes(1);

    expect(called).toBe(0);
    await user.click(component.container.children[0]);
    expect(called).toBe(1);

    mock.mockReset();
  });
});

describe("logout", () => {
  test("Pressing", async () => {
    const user = userEvent.setup();

    let called = 0;
    const mock = jest.spyOn(auth0, "useAuth0").mockImplementation(
      () =>
        ({
          logout: () => {
            called++;
            return Promise.resolve();
          },
        }) as auth0.Auth0ContextInterface,
    );

    const component = render(<LogoutButton />);
    expect(component.container).toBeInTheDocument();
    expect(mock).toHaveBeenCalledTimes(1);

    expect(called).toBe(0);
    await user.click(component.container.children[0]);
    expect(called).toBe(1);

    mock.mockReset();
  });
});
