import { type APIClient } from "@esp-group-one/api-client";
import * as Auth0 from "@auth0/auth0-react";
import { getUser } from "@esp-group-one/types/build/tests/helpers/utils";
import { partiallyImpl } from "../helpers/utils";
import { isNewUser, useAPIClient } from "../../src/lib/auth";
import { mockReact } from "../__meta__";

jest.mock("@auth0/auth0-react");

describe("client-side auth tests", () => {
  const USER_EXISTS = partiallyImpl<APIClient>(
    Object.freeze({
      user() {
        return {
          me: () => Promise.resolve(getUser({})),
        };
      },
    }),
  );

  const NO_SPORTS_USER_EXISTS = partiallyImpl<APIClient>(
    Object.freeze({
      user() {
        return {
          me: () => Promise.resolve(getUser({ sports: [] })),
        };
      },
    }),
  );

  const USER_NOT_EXISTS = partiallyImpl<APIClient>(
    Object.freeze({
      user() {
        return {
          me: () => Promise.reject(new Error("Not found")),
        };
      },
    }),
  );

  test("useAPIClient", async () => {
    const { useRef } = await mockReact();
    useRef.mockReturnValue({ current: 1 });
    const useAuth0 = jest.spyOn(Auth0, "useAuth0");
    const impl = partiallyImpl<Auth0.Auth0ContextInterface<{ name: string }>>({
      getAccessTokenSilently: jest.fn(() => Promise.resolve("TEST-TOKEN")),
    });
    useAuth0.mockImplementation(() => impl);

    // isAuthenticated == false && client.current == _
    expect(await useAPIClient(false)).toBeUndefined();

    // isAuthenticated == true && client.current !== undefined
    useRef.mockReturnValue({ current: 1 });
    expect(await useAPIClient(true)).toBe(1);

    // isAuthenticaed == true && client.current === undefined
    const obj: { current: APIClient | undefined } = { current: undefined };
    useRef.mockImplementation(() => obj);
    await useAPIClient(true);

    expect(impl.getAccessTokenSilently).toHaveBeenCalled();
    expect(obj.current).not.toBeUndefined();
  });

  test("isNewUser", async () => {
    expect(await isNewUser(USER_EXISTS)).toBe(false);
    expect(await isNewUser(NO_SPORTS_USER_EXISTS)).toBe(true);

    // Mainly to suppress the warning in the test logs.
    const consoleWarn = jest
      .spyOn(console, "warn")
      .mockImplementation(() => void 0);

    expect(await isNewUser(USER_NOT_EXISTS)).toBe(true);

    expect(consoleWarn).toHaveBeenCalled();
  });
});
