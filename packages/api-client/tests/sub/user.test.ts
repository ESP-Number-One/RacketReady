import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import type { QueryOptions } from "@esp-group-one/types";
import { newAPISuccess } from "@esp-group-one/types";
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

describe("getProfilePic", () => {
  const id = OIDS[0];
  const resObj = "data:image/webp;base64,AAAAAAAA";
  const endpoint = `user/${id.toString()}/profile_picture`;
  test("Normal", async () => {
    fetchMockEndpointOnce(endpoint, newAPISuccess(resObj));

    await expect(api.getProfileSrc(id)).resolves.toStrictEqual(resObj);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  runErrorTests(endpoint, () => api.getProfileSrc(id));
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
