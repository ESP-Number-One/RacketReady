import type { WithError } from "@esp-group-one/types";
import { API_URL } from "./constants.js";

export class APIClientBase {
  protected url = "";

  constructor(url?: string) {
    this.url = url ?? API_URL;
  }

  protected get<T>(
    endpoint: string,
    query: Record<string, unknown>,
    extra?: object,
  ): Promise<T> {
    var encodedQuery = Object.entries(query)
      .map(([name, val]): string => {
        if (val === undefined) return "";

        const encodedName = encodeURIComponent(name);
        const encodedVal = encodeURIComponent(
          typeof val === "string" ? val : JSON.stringify(val),
        );
        return `${encodedName}=${encodedVal}`;
      })
      .join("&");

    if (encodedQuery !== "") {
      encodedQuery = "?" + encodedQuery;
    }

    return this.request<T>("GET", endpoint + encodedQuery, undefined, extra);
  }

  protected post<T>(
    endpoint: string,
    body: unknown,
    extra?: object,
  ): Promise<T> {
    return this.request<T>("POST", endpoint, body, extra);
  }

  private async request<T>(
    type: string,
    endpoint: string,
    body: unknown,
    extra?: object,
  ): Promise<T> {
    const headers: Headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    const request: RequestInfo = new Request(`${this.url}/${endpoint}`, {
      method: type,
      headers,
      body: JSON.stringify(body),
      ...extra,
    });

    return fetch(request).then(async (res) => {
      const json = (await res.json()) as WithError<unknown>;

      if (!json.success) {
        throw Error(`Request failed: ${json.error}`);
      } else if (res.status % 100 !== 2) {
        throw Error(`Request failed with status ${res.status}`);
      }

      return json.data;
    }) as T;
  }
}
