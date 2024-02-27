import type { Success, WithError } from "@esp-group-one/types";
import { ObjectId } from "@esp-group-one/types";
import { API_URL } from "./constants.js";

export class APIClientBase {
  public url = "";
  protected accessToken: string;

  constructor(accessToken: string, url?: string) {
    this.url = url ?? API_URL;
    this.accessToken = accessToken;
  }

  protected get<T>(
    endpoint: string,
    query: Record<string, unknown>,
    extra?: object,
  ): Promise<T> {
    let encodedQuery = Object.entries(query)
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
      encodedQuery = `?${encodedQuery}`;
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

  private request<T>(
    type: string,
    endpoint: string,
    body: unknown,
    extra?: object,
  ): Promise<T> {
    const headers: Headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    headers.set("authorization", `Bearer ${this.accessToken}`);

    const request: RequestInfo = new Request(`${this.url}/${endpoint}`, {
      method: type,
      headers,
      body: JSON.stringify(body),
      ...extra,
    });

    return fetch(request).then(async (res) => {
      const json = (await res.json()) as Partial<WithError<T>>;

      if (json.success === false) {
        throw Error(`Request failed: ${json.error}`);
      } else if (!json.success || Math.floor(res.status / 100) !== 2) {
        // Note we check json.success again to catch any anomalities returned
        // from the api
        throw Error(`Request failed with status ${res.status}`);
      }

      return ObjectId.fromObj((json as Success<T>).data) as T;
    });
  }
}
