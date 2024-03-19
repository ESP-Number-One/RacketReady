import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import type {
  QueryOptions,
  SportInfo,
  UserMatchReturn,
} from "@esp-group-one/types";
import { AbilityLevel, Sport, newAPISuccess } from "@esp-group-one/types";
import { getUser, OIDS } from "@esp-group-one/test-helpers";
import { getAvailability } from "@esp-group-one/types/build/tests/helpers/utils.js";
import { fetchMockEndpointOnce, runErrorTests } from "../helpers/utils.js";
import type { UserAPIClient } from "../../src/sub/user.js";
import { APIClient } from "../../src/client.js";
import { fetchMock } from "../helpers/fetch_mock.js";

fetchMock.enableMocks();
beforeEach(() => {
  fetchMock.resetMocks();
});

let api: UserAPIClient;
beforeAll(() => {
  api = new APIClient("gimmeaccess").user();
});

describe("addAvailability", () => {
  const availability = getAvailability({});
  const endpoint = "user/me/availability/add";
  test("Normal", async () => {
    fetchMockEndpointOnce(endpoint, newAPISuccess(undefined), {
      body: availability,
    });

    await expect(api.addAvailability(availability)).resolves.toStrictEqual(
      undefined,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  runErrorTests(endpoint, () => api.addAvailability(availability));
});

describe("addSports", () => {
  const sports: SportInfo[] = [
    { sport: Sport.Squash, ability: AbilityLevel.Advanced },
    { sport: Sport.Badminton, ability: AbilityLevel.Beginner },
  ];
  const endpoint = "user/me/sports/add";

  test("Normal", async () => {
    fetchMockEndpointOnce(endpoint, newAPISuccess(undefined), {
      body: { sports },
    });

    await expect(api.addSports(...sports)).resolves.toStrictEqual(undefined);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  runErrorTests(endpoint, () => api.addSports(sports[0]));
});

describe("checkAbility", () => {
  const endpoint = "user/me/ability/check";
  const output: SportInfo[] = [
    { sport: Sport.Tennis, ability: AbilityLevel.Intermediate },
  ];

  test("Normal", async () => {
    fetchMockEndpointOnce(endpoint, newAPISuccess(output));

    await expect(api.checkAbility()).resolves.toStrictEqual(output);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  runErrorTests(endpoint, () => api.checkAbility());
});

describe("edit", () => {
  const endpoint = "user/me/edit";

  test("Normal", async () => {
    const body = { name: "Test bot 10000" };

    fetchMockEndpointOnce(endpoint, newAPISuccess(undefined), { body });

    await expect(api.editMe(body)).resolves.toBe(undefined);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  runErrorTests(endpoint, () => api.editMe({ description: "Something" }));
});

describe("findAvailabilityWith", () => {
  const id = OIDS[0];
  const query: QueryOptions<undefined> = { pageSize: 10 };
  const endpoint = `user/${id.toString()}/availability`;

  test("Normal", async () => {
    fetchMockEndpointOnce(endpoint, newAPISuccess(["10:30", "11:30"]), {
      body: query,
    });

    await expect(api.findAvailabilityWith(id, query)).resolves.toStrictEqual([
      "10:30",
      "11:30",
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  runErrorTests(endpoint, () => api.findAvailabilityWith(id, query));
});

describe("recommendations", () => {
  const endpoint = `user/recommendations`;
  const result: UserMatchReturn = [
    { u: getUser({}), sport: Sport.Tennis },
    { u: getUser({}), sport: Sport.Badminton },
  ];

  test("Normal", async () => {
    fetchMockEndpointOnce(endpoint, newAPISuccess(result));

    await expect(api.recommendations()).resolves.toStrictEqual(result);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  runErrorTests(endpoint, () => api.recommendations());
});

describe("me", () => {
  const resObj = getUser({});

  const endpoint = "user/me";
  test("Normal", async () => {
    fetchMockEndpointOnce(endpoint, newAPISuccess(resObj));

    await expect(api.me()).resolves.toStrictEqual(resObj);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  runErrorTests(endpoint, () => api.me());
});
