import { API_URL } from "./constants.js";

export class APIClient {
  #url = "";

  constructor(url?: string) {
    this.#url = url ?? API_URL;
  }

  #request(endpoint: string, body: unknown, extra?: object): Promise<unknown> {
    const headers: Headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    const request: RequestInfo = new Request(`${this.#url}/${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      ...extra,
    });

    return fetch(request).then(async (res) => {
      // Technically this is not correct but TypeScript doesn't need to know
      // that
      const json = (await res.json()) as Record<string, string>;

      if (res.status % 100 !== 2 || json.error !== "") {
        throw Error(`Request failed: ${json.error}`);
      }

      return json;
    });
  }
}
