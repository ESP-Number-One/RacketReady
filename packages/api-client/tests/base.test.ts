import { beforeEach, describe, expect, test } from "@jest/globals";
import fetchMockImp, { type FetchMock } from "jest-fetch-mock";
import { newAPISuccess } from "@esp-group-one/types";
import { APIClientBase } from "../src/base.js";
import { fetchMockEndpointOnce, runErrorTests } from "./lib/utils.js";

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

class TestAPIClient extends APIClientBase {
  public get<T>(
    endpoint: string,
    query: Record<string, unknown>,
    extra?: object,
  ): Promise<T> {
    return super.get<T>(endpoint, query, extra);
  }

  public post<T>(endpoint: string, body: unknown, extra?: object): Promise<T> {
    return super.post<T>(endpoint, body, extra);
  }
}

let api: TestAPIClient;

beforeEach(() => {
  api = new TestAPIClient("gimmeaccess");
});

describe("get", () => {
  test("with params", async () => {
    const query = {
      val: "test",
      thing: 12,
      another: { val: "something" },
      list: [1, 2, "hi"],
    };
    const expectedQuery = {
      ...query,
      thing: query.thing.toString(),
      another: JSON.stringify(query.another),
      list: JSON.stringify(query.list),
    };
    fetchMockEndpointOnce("test", newAPISuccess({}), { query: expectedQuery });

    await expect(
      api.get("test", { ...query, nullable: undefined }),
    ).resolves.toStrictEqual({});
  });

  runErrorTests("test", () => api.get("test", {}));
});

describe("post", () => {
  test("with body", async () => {
    const body = {
      val: "test",
      thing: 12,
      another: { val: "something" },
      list: [1, 2, "hi"],
    };
    fetchMockEndpointOnce("test", newAPISuccess({}), { body });

    await expect(
      api.post<unknown>("test", { ...body, nullable: undefined }),
    ).resolves.toStrictEqual({});
  });

  runErrorTests("test", () => api.post("test", {}));
});
