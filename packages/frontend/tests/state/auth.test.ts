import { APIClient } from "@esp-group-one/api-client";
import { getUser } from "@esp-group-one/types/build/tests/helpers/utils";
import { UserAPIClient } from "@esp-group-one/api-client/build/src/sub/user";
import { AbilityLevel, Sport } from "@esp-group-one/types";
import { SKIPPED_ABILITY_LEVELUP, handleApi } from "../../src/state/auth";
import type { AuthResult } from "../../src/state/auth";

describe("handleAPI", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("No client", async () => {
    const hasSetAPI = { current: false };
    const setResult = jest.fn((res: AuthResult) => {
      expect(res).toStrictEqual({ type: "ok", ok: { authenticated: false } });
    });
    const signup = jest.fn();

    const handler = handleApi(hasSetAPI, setResult, signup);
    await handler(undefined);
    expect(hasSetAPI.current).toBe(true);
    expect(setResult).toHaveBeenCalledTimes(1);
    expect(signup).toHaveBeenCalledTimes(0);
  });

  test("is previous user", async () => {
    const client: APIClient = new APIClient("test_token");
    const me = jest
      .spyOn(UserAPIClient.prototype, "me")
      .mockImplementation(() => Promise.resolve(getUser({})));

    const checkAbility = jest
      .spyOn(UserAPIClient.prototype, "checkAbility")
      .mockImplementation(() => Promise.resolve([]));

    const hasSetAPI = { current: false };
    const setResult = jest.fn((res: AuthResult) => {
      expect(res).toStrictEqual({
        type: "ok",
        ok: { authenticated: true, client },
      });
    });
    const signup = jest.fn();

    const handler = handleApi(hasSetAPI, setResult, signup);
    await handler(client);

    expect(hasSetAPI.current).toBe(true);
    expect(setResult).toHaveBeenCalledTimes(1);
    expect(signup).toHaveBeenCalledTimes(0);
    expect(me).toHaveBeenCalledTimes(1);
    expect(checkAbility).toHaveBeenCalledTimes(1);
  });

  test("is user without sports", async () => {
    const client: APIClient = new APIClient("test_token");
    const user = client.user();
    const me = jest
      .spyOn(user, "me")
      .mockImplementation(() => Promise.resolve(getUser({ sports: [] })));

    const hasSetAPI = { current: false };
    const setResult = jest.fn((res: AuthResult) => {
      expect(res).toStrictEqual({
        type: "ok",
        ok: { authenticated: true, client },
      });
    });
    const signup = jest.fn();

    const handler = handleApi(hasSetAPI, setResult, signup);
    await handler(client);

    expect(hasSetAPI.current).toBe(true);
    expect(setResult).toHaveBeenCalledTimes(1);
    expect(signup).toHaveBeenCalledTimes(1);
    expect(me).toHaveBeenCalledTimes(1);
  });

  test("is new user", async () => {
    const client: APIClient = new APIClient("test_token");
    const user = client.user();
    const me = jest
      .spyOn(user, "me")
      .mockImplementation(() => Promise.reject(new Error("New user")));

    const hasSetAPI = { current: false };
    const setResult = jest.fn((res: AuthResult) => {
      expect(res).toStrictEqual({
        type: "ok",
        ok: { authenticated: true, client },
      });
    });
    const signup = jest.fn();

    const handler = handleApi(hasSetAPI, setResult, signup);
    await handler(client);

    expect(hasSetAPI.current).toBe(true);
    expect(setResult).toHaveBeenCalledTimes(1);
    expect(signup).toHaveBeenCalledTimes(1);
    expect(me).toHaveBeenCalledTimes(1);
  });

  describe("Ability level up", () => {
    test("accept", async () => {
      localStorage.removeItem(SKIPPED_ABILITY_LEVELUP);
      const confirmMock = jest.spyOn(window, "confirm").mockReturnValue(true);

      const client: APIClient = new APIClient("test_token");
      const me = jest
        .spyOn(UserAPIClient.prototype, "me")
        .mockImplementation(() => Promise.resolve(getUser({})));

      const checkAbility = jest
        .spyOn(UserAPIClient.prototype, "checkAbility")
        .mockImplementation(() =>
          Promise.resolve([
            { sport: Sport.Tennis, ability: AbilityLevel.Beginner },
            { sport: Sport.Squash, ability: AbilityLevel.Beginner },
          ]),
        );

      const addSports = jest
        .spyOn(UserAPIClient.prototype, "addSports")
        .mockImplementation((...sports) => {
          expect(sports).toStrictEqual([
            { sport: Sport.Tennis, ability: AbilityLevel.Beginner },
            { sport: Sport.Squash, ability: AbilityLevel.Beginner },
          ]);
          return Promise.resolve();
        });

      const hasSetAPI = { current: false };
      const setResult = jest.fn((res: AuthResult) => {
        expect(res).toStrictEqual({
          type: "ok",
          ok: { authenticated: true, client },
        });
      });
      const signup = jest.fn();

      const handler = handleApi(hasSetAPI, setResult, signup);
      await handler(client);

      expect(hasSetAPI.current).toBe(true);
      expect(setResult).toHaveBeenCalledTimes(1);
      expect(signup).toHaveBeenCalledTimes(0);
      expect(me).toHaveBeenCalledTimes(1);
      expect(checkAbility).toHaveBeenCalledTimes(1);
      expect(confirmMock).toHaveBeenCalledTimes(2);
      expect(addSports).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem(SKIPPED_ABILITY_LEVELUP)).toBeNull();
    });

    test("decline all", async () => {
      localStorage.removeItem(SKIPPED_ABILITY_LEVELUP);
      const confirmMock = jest.spyOn(window, "confirm").mockReturnValue(false);

      const client: APIClient = new APIClient("test_token");
      const me = jest
        .spyOn(UserAPIClient.prototype, "me")
        .mockImplementation(() => Promise.resolve(getUser({})));

      const checkAbility = jest
        .spyOn(UserAPIClient.prototype, "checkAbility")
        .mockImplementation(() =>
          Promise.resolve([
            { sport: Sport.Tennis, ability: AbilityLevel.Beginner },
            { sport: Sport.Squash, ability: AbilityLevel.Beginner },
          ]),
        );

      const addSports = jest
        .spyOn(UserAPIClient.prototype, "addSports")
        .mockImplementation(() => {
          return Promise.resolve();
        });

      const hasSetAPI = { current: false };
      const setResult = jest.fn((res: AuthResult) => {
        expect(res).toStrictEqual({
          type: "ok",
          ok: { authenticated: true, client },
        });
      });
      const signup = jest.fn();

      const handler = handleApi(hasSetAPI, setResult, signup);
      await handler(client);

      expect(hasSetAPI.current).toBe(true);
      expect(setResult).toHaveBeenCalledTimes(1);
      expect(signup).toHaveBeenCalledTimes(0);
      expect(me).toHaveBeenCalledTimes(1);
      expect(checkAbility).toHaveBeenCalledTimes(1);
      expect(confirmMock).toHaveBeenCalledTimes(1); // will break after the first
      expect(addSports).toHaveBeenCalledTimes(0);
      expect(localStorage.getItem(SKIPPED_ABILITY_LEVELUP)).toBe("yup");
    });

    test("decline second", async () => {
      localStorage.removeItem(SKIPPED_ABILITY_LEVELUP);
      let confirmRet = true;
      const confirmMock = jest
        .spyOn(window, "confirm")
        .mockImplementation(() => {
          confirmRet = !confirmRet;
          return !confirmRet;
        });

      const client: APIClient = new APIClient("test_token");
      const me = jest
        .spyOn(UserAPIClient.prototype, "me")
        .mockImplementation(() => Promise.resolve(getUser({})));

      const checkAbility = jest
        .spyOn(UserAPIClient.prototype, "checkAbility")
        .mockImplementation(() =>
          Promise.resolve([
            { sport: Sport.Tennis, ability: AbilityLevel.Beginner },
            { sport: Sport.Squash, ability: AbilityLevel.Beginner },
          ]),
        );

      const addSports = jest
        .spyOn(UserAPIClient.prototype, "addSports")
        .mockImplementation((...sports) => {
          expect(sports).toStrictEqual([
            { sport: Sport.Tennis, ability: AbilityLevel.Beginner },
          ]);
          return Promise.resolve();
        });

      const hasSetAPI = { current: false };
      const setResult = jest.fn((res: AuthResult) => {
        expect(res).toStrictEqual({
          type: "ok",
          ok: { authenticated: true, client },
        });
      });
      const signup = jest.fn();

      const handler = handleApi(hasSetAPI, setResult, signup);
      await handler(client);

      expect(hasSetAPI.current).toBe(true);
      expect(setResult).toHaveBeenCalledTimes(1);
      expect(signup).toHaveBeenCalledTimes(0);
      expect(me).toHaveBeenCalledTimes(1);
      expect(checkAbility).toHaveBeenCalledTimes(1);
      expect(confirmMock).toHaveBeenCalledTimes(2);
      expect(addSports).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem(SKIPPED_ABILITY_LEVELUP)).toBe("yup");
    });
  });
});
