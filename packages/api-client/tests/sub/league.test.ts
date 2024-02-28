import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import { newAPISuccess, Sport } from "@esp-group-one/types";
import { IDS, OIDS } from "@esp-group-one/test-helpers";
import { fetchMockEndpointOnce, runErrorTests } from "../helpers/utils.js";
import { APIClient } from "../../src/client.js";
import type { LeagueAPIClient } from "../../src/sub/league.js";
import { fetchMock } from "../helpers/fetch_mock.js";

fetchMock.enableMocks();
beforeEach(() => {
  fetchMock.resetMocks();
});

let api: LeagueAPIClient;
beforeAll(() => {
  api = new APIClient("gimmeaccess").league();
});

describe("edit", () => {
  const id = OIDS[0];
  const endpoint = `league/${IDS[0]}/edit`;

  test("Normal", async () => {
    const body = { name: "Test league 10000" };

    fetchMockEndpointOnce(endpoint, newAPISuccess(undefined), { body });

    await expect(api.edit(id, body)).resolves.toBe(undefined);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  runErrorTests(endpoint, () => api.edit(id, { sport: Sport.Squash }));
});

describe("join", () => {
  const id = OIDS[0];
  const endpoint = `league/${IDS[0]}/join`;

  test("with inviteCode", async () => {
    const inviteCode = "HI";

    fetchMockEndpointOnce(endpoint, newAPISuccess(undefined), {
      body: { inviteCode },
    });

    await expect(api.join(id, inviteCode)).resolves.toBe(undefined);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("without inviteCode", async () => {
    fetchMockEndpointOnce(endpoint, newAPISuccess(undefined), {
      body: {},
    });

    await expect(api.join(id)).resolves.toBe(undefined);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  runErrorTests(endpoint, () => api.join(id));
});

describe("getInviteCode", () => {
  const id = OIDS[0];
  const endpoint = `league/${IDS[0]}/invite`;

  test("normal", async () => {
    fetchMockEndpointOnce(endpoint, newAPISuccess(undefined), { query: {} });

    await expect(api.getInviteCode(id)).resolves.toBe(undefined);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  runErrorTests(endpoint, () => api.getInviteCode(id));
});
