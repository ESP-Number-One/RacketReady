import type { QueryOptions } from "@esp-group-one/types";
import { APIClientBase } from "../base.js";

export class SubAPIClient<T, C> extends APIClientBase {
  public getId(id: string): Promise<T> {
    return this.get<T>(id, {});
  }

  public find(query: QueryOptions): Promise<T[]> {
    return this.get<T[]>("find", query as Record<string, unknown>);
  }

  public create(obj: C): Promise<T> {
    return this.post<T>("new", obj);
  }
}
