import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import fetchMockImp, { type FetchMock } from "jest-fetch-mock";
import type { Scores } from "@esp-group-one/types";
import { newAPISuccess, ObjectId, Sport, tests } from "@esp-group-one/types";
import { fetchMockEndpointOnce, runErrorTests } from "../lib/utils.js";
import { APIClient } from "../../src/client.js";
import type { MatchAPIClient } from "../../src/sub/match.js";

const { getMatch, IDS } = tests;

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

let api: MatchAPIClient;
beforeAll(() => {
  api = new APIClient("gimmeaccess").match();
});

describe("findProposed", () => {
  const resObj = [
    getMatch({ sport: Sport.Tennis }),
    getMatch({ sport: Sport.Squash }),
  ];

  const endpoint = `match/find/proposed`;
  test("Normal", async () => {
    const body = { pageSize: 10 };
    fetchMockEndpointOnce(endpoint, newAPISuccess(resObj), { body });

    await expect(api.findProposed(body)).resolves.toStrictEqual(resObj);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  runErrorTests(endpoint, () => api.findProposed({}));
});

describe("accept", () => {
  const id = new ObjectId(IDS[0]);
  const resObj = undefined;
  const endpoint = `match/${IDS[0]}/accept`;
  test("Normal", async () => {
    fetchMockEndpointOnce(endpoint, newAPISuccess(resObj));

    await expect(api.accept(id)).resolves.toStrictEqual(resObj);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  runErrorTests(endpoint, () => api.accept(id));
});

describe("complete", () => {
  const id = new ObjectId(IDS[0]);
  const resObj = undefined;
  const endpoint = `match/${IDS[0]}/complete`;
  test("Normal", async () => {
    const body: Scores = {};
    body[id.toString()] = 20;
    body[IDS[1]] = 5;

    fetchMockEndpointOnce(endpoint, newAPISuccess(resObj), {
      body,
    });

    await expect(api.complete(id, body)).resolves.toStrictEqual(resObj);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  runErrorTests(endpoint, () => api.complete(id, {}));
});