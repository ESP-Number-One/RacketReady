import { beforeEach, describe, expect, test } from "@jest/globals";
import { newAPISuccess } from "@esp-group-one/types";
import { APIClientBase } from "../src/base.js";
import { fetchMockEndpointOnce, runErrorTests } from "./helpers/utils.js";
import { fetchMock } from "./helpers/fetch_mock.js";

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
