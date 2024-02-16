import { expect } from "@jest/globals";
import fetchMockImp, { FetchMock } from "jest-fetch-mock";
import { newAPIError } from "@esp-group-one/types";

// TypeScript is weird and seems to believe the type is two different things
// depending on running build/test
const fetchMock = (
  "default" in fetchMockImp ? fetchMockImp.default : fetchMockImp
) as FetchMock;

export function fetchMockEndpointOnce<T, R>(
  endpoint: string,
  res: T,
  opts: {
    body?: R;
    apiToken?: string;
  } = {},
) {
  fetchMock.mockOnceIf(
    new RegExp(`http://localhost:3000/${endpoint}/?(\\?.*)?`),
    async (req: Request) => {
      if (opts.body) expect(await req.json()).toStrictEqual(opts.body);

      expect(req.headers.get("authorization")).toBe(
        `Bearer ${opts.apiToken ?? "gimmeaccess"}`,
      );
      return Promise.resolve({ body: JSON.stringify(res) });
    },
  );
}

export function runErrorTests<T>(endpoint: string, apiCall: () => Promise<T>) {
  test("Returned error", async () => {
    fetchMockEndpointOnce(endpoint, newAPIError("There was an error"));

    const error = await apiCall().catch((e) => e.toString());
    expect(error).toBe("Error: Request failed: There was an error");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("Server error", async () => {
    fetchMock.mockReject(() => Promise.reject("API is down"));

    const error = await apiCall().catch((e) => e.toString());
    expect(error).toBe("API is down");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
}
