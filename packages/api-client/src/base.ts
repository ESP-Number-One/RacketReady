import type { WithError } from "@esp-group-one/types";
import { API_URL } from "./constants.js";

export class APIClientBase {
  protected url = "";

  constructor(url?: string) {
    this.url = url ?? API_URL;
  }

  protected get(
    endpoint: string,
    body: unknown,
    extra?: object,
  ): Promise<unknown> {
    return this.request("GET", endpoint, body, extra);
  }

  protected post(
    endpoint: string,
    body: unknown,
    extra?: object,
  ): Promise<unknown> {
    return this.request("POST", endpoint, body, extra);
  }

  private async request(
    type: string,
    endpoint: string,
    body: unknown,
    extra?: object,
  ): Promise<unknown> {
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
    });
  }
}
