import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import fetchMockImp, { type FetchMock } from "jest-fetch-mock";
import { newAPISuccess, ObjectId, tests } from "@esp-group-one/types";
import { fetchMockEndpointOnce, runErrorTests } from "../lib/utils.js";
import type { UserAPIClient } from "../../src/sub/user.js";
import { APIClient } from "../../src/client.js";

const { getUser } = tests;

// TypeScript is weird and seems to believe the type is two different things
// depending on running build/test
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- two typescript versions colliding
const fetchMock: FetchMock = (
  "default" in fetchMockImp ? fetchMockImp.default : fetchMockImp
) as FetchMock;

fetchMock.enableMocks();
beforeEach(() => {
  fetchMock.resetMocks();
});

describe("getProfilePic", () => {
  let api: UserAPIClient;
  beforeAll(() => {
    api = new APIClient("gimmeaccess").user();
  });

  const id = new ObjectId("my_custom_id");
  const resObj = "data:image/webp;base64,AAAAAAAA";
  const endpoint = `user/${id.toString()}/profile_picture`;
  test("Normal", async () => {
    fetchMockEndpointOnce(endpoint, newAPISuccess(resObj));

    const res = await api.getProfileSrc(id);
    expect(res).toStrictEqual(resObj);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  runErrorTests(endpoint, () => api.getProfileSrc(id));
});

describe("me", () => {
  let api: UserAPIClient;
  beforeAll(() => {
    api = new APIClient("gimmeaccess").user();
  });

  const resObj = getUser({});

  const endpoint = "user/me";
  test("Normal", async () => {
    fetchMockEndpointOnce(endpoint, newAPISuccess(resObj));

    const res = await api.me();
    expect(res).toStrictEqual(resObj);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  runErrorTests(endpoint, () => api.me());
});
