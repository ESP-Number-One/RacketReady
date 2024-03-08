import { expect, test } from "@jest/globals";
import { newAPIError } from "@esp-group-one/types";
import { fetchMock } from "./fetch_mock.js";

export function fetchMockEndpointOnce<T, R>(
  endpoint: string,
  res: T,
  opts?: {
    status?: number;
    body?: R;
    query?: R;
    apiToken?: string;
  },
) {
  fetchMock.mockOnceIf(
    new RegExp(`http://localhost:3000/${endpoint}/?(\\?.*)?`),
    async (req: Request) => {
      if (opts?.body)
        await expect(req.json()).resolves.toStrictEqual(opts.body);
      if (opts?.query) {
        const url = new URL(req.url);
        const params = Object.fromEntries(url.searchParams.entries());
        expect(params).toStrictEqual(opts.query);
      }

      expect(req.headers.get("authorization")).toBe(
        `Bearer ${opts?.apiToken ?? "gimmeaccess"}`,
      );
      return Promise.resolve({
        status: opts?.status ?? 200,
        body: JSON.stringify(res),
      });
    },
  );
}

export function runErrorTests<T>(endpoint: string, apiCall: () => Promise<T>) {
  test("Returned error", async () => {
    fetchMockEndpointOnce(endpoint, newAPIError("There was an error"));

    await expect(apiCall()).rejects.toThrowError(
      "Request failed: There was an error",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("Server error", async () => {
    fetchMock.mockReject(() => Promise.reject(new Error("API is down")));

    await expect(apiCall()).rejects.toThrowError("API is down");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("Status code", async () => {
    fetchMockEndpointOnce(endpoint, {}, { status: 500 });

    await expect(apiCall()).rejects.toThrowError(
      "Request failed with status 500",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
}
