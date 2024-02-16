import type {
  Collection,
  Document,
  Filter,
  OptionalId,
  Sort,
  UpdateFilter,
} from "mongodb";
import type { MongoDBItem, ObjectId } from "@esp-group-one/types";
import type { FilterOptions, ReplaceObjectId } from "./types.js";
import { toInternal, toMongo } from "./types.js";

/**
 * This is here to give a much nicer interface which handles the types
 * correctly
 *
 * This can be inherited from down the line if we want to add more specific
 * functions
 */
export class CollectionWrap<T extends MongoDBItem> {
  private collection: Collection;

  constructor(collection: Collection) {
    this.collection = collection;
  }

  /**
   * @returns if there are more than one element with your specific query
   */
  public async exists(query: Filter<T>): Promise<boolean> {
    return (await this.page({ query, pageSize: 1 })).length > 0;
  }

  /**
   * This is mostly here for internal reasons, please consider to use the page
   * function instead to reduce load on the database, api and client
   *
   * @returns all items found which match the query in the collection
   */
  public async find(query: Filter<T>): Promise<T[]> {
    const q = toMongo(query) as unknown as Filter<Document>;
    return (await this.collection.find(q).toArray()) as unknown[] as T[];
  }

  /**
   * @returns the object with the given ObjectId
   */
  public async get(id: ObjectId): Promise<T | undefined> {
    return toInternal<T | undefined>(
      (await this.page({ query: { _id: toMongo(id) }, pageSize: 1 })).at(
        0,
      ) as ReplaceObjectId<T>,
    );
  }

  /**
   * Inserts all given items to the collection
   *
   * @returns the ids of the items inserted
   */
  public insert(...items: OptionalId<T>[]): Promise<ObjectId[]> {
    return this.collection
      .insertMany(toMongo(items) as unknown as OptionalId<Document>[])
      .then((res) =>
        toInternal<ObjectId[]>(
          Object.values(res.insertedIds) as unknown as ReplaceObjectId<
            ObjectId[]
          >,
        ),
      )
      .catch(() => [] as ObjectId[]);
  }

  /**
   * This allows us to easily page a collection and not return all the results.
   * Reducing load on client + database
   *
   * @returns opts.pageSize sized array (or less) with the items that match the
   *   query
   */
  public async page(opts: FilterOptions<T>): Promise<T[]> {
    const req = this.collection
      .find(opts.query as Filter<Document>)
      .skip(opts.pageStart ?? 0)
      .limit(opts.pageSize ?? 20);

    if (opts.sort) req.sort(opts.sort as Sort);

    return toInternal<T[]>(
      (await req.toArray()) as unknown[] as ReplaceObjectId<T>[],
    );
  }

  public async edit(
    id: ObjectId,
    update: UpdateFilter<T> | Partial<T>,
  ): Promise<void> {
    await this.collection.updateOne({ _id: id }, update);
  }
}
