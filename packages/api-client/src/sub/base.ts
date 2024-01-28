import type { QueryOptions } from "@esp-group-one/types";
import { APIClientBase } from "../base.js";

export class SubAPIClient<T, C> extends APIClientBase {
  public getId(id: string): Promise<T> {
    return this.get(id, {}) as Promise<T>;
  }

  public find(query: QueryOptions): Promise<T[]> {
    return this.get("find", query) as Promise<T[]>;
  }

  public create(obj: C): Promise<T> {
    return this.post("new", obj) as Promise<T>;
  }
}
