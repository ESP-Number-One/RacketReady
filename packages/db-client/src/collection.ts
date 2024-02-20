import type {
  Collection,
  Document,
  Filter,
  InsertManyResult,
  ObjectId,
  OptionalId,
  Sort,
  UpdateFilter,
} from "mongodb";
import type { QueryOptions } from "@esp-group-one/types";

/**
 * This is here to give a much nicer interface which handles the types
 * correctly
 *
 * This can be inherited from down the line if we want to add more specific
 * functions
 */
export class CollectionWrap<T> {
  private collection: Collection;

  constructor(collection: Collection) {
    this.collection = collection;
  }

  /**
   * @returns if there are more than one element with your specific query
   */
  public async exists(query: Filter<Document>): Promise<boolean> {
    return (await this.page({ query, pageSize: 1 })).length > 0;
  }

  /**
   * This is mostly here for internal reasons, please consider to use the page
   * function instead to reduce load on the database, api and client
   */
  public async find(query: Filter<Document>): Promise<T[]> {
    return (await this.collection.find(query).toArray()) as unknown[] as T[];
  }

  public async get(id: ObjectId): Promise<T | undefined> {
    return (await this.page({ query: { _id: id }, pageSize: 1 })).at(0);
  }

  public insert(...items: OptionalId<T>[]): Promise<InsertManyResult> {
    return this.collection.insertMany(items);
  }

  public async page(opts: QueryOptions): Promise<T[]> {
    const req = this.collection
      .find(opts.query ?? {})
      .skip(opts.pageStart ?? 0)
      .limit(opts.pageSize ?? 20);

    if (opts.sort) req.sort(opts.sort as Sort);

    return (await req.toArray()) as unknown[] as T[];
  }

  public async edit(
    id: ObjectId,
    update: UpdateFilter<T> | Partial<T>,
  ): Promise<void> {
    await this.collection.updateOne({ _id: id }, update);
  }
}
