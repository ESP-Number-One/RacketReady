import type { ObjectId, PageOptions, SortQuery } from "@esp-group-one/types";
import { APIClientBase } from "../base.js";

export class SubAPIClient<
  FullType,
  Censored,
  Creation,
  Query,
> extends APIClientBase {
  /**
   * Creates the given object
   *
   * @param obj - The object to define the creation
   * @returns the full type
   */
  public create(obj: Creation): Promise<FullType> {
    return this.post("new", obj);
  }

  /**
   * @returns the censored object matching the given id
   */
  public getId(id: ObjectId): Promise<Censored> {
    return this.get(id.toString(), {});
  }

  /**
   * @returns all users found matching the query
   */
  public find(
    query: PageOptions<Query, SortQuery<FullType>>,
  ): Promise<Censored[]> {
    return this.post("find", query);
  }
}
