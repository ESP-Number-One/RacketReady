import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import { newAPISuccess, ObjectId } from "@esp-group-one/types";
import { getUser, IDS } from "@esp-group-one/test-helpers";
import { fetchMockEndpointOnce, runErrorTests } from "../helpers/utils.js";
import type { UserAPIClient } from "../../src/sub/user.js";
import { APIClient } from "../../src/client.js";
import { fetchMock } from "../helpers/fetch_mock.js";

fetchMock.enableMocks();
beforeEach(() => {
  fetchMock.resetMocks();
});

describe("getProfilePic", () => {
  let api: UserAPIClient;
  beforeAll(() => {
    api = new APIClient("gimmeaccess").user();
  });

  const id = new ObjectId(IDS[0]);
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
