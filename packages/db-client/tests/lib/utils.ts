import type { Collection, Db, OptionalId } from "mongodb";
import { MongoClient } from "mongodb";
import { ObjectId } from "@esp-group-one/types";
import { toMongo } from "../../src/types.js";

declare global {
  /**
   * The URI of the test MongoDB server.
   */
  let __MONGO_URI__: string;

  /**
   * The name of the database you should connect to.
   */
  let __MONGO_DB_NAME__: string;
}

export function setup() {
  // eslint-disable-next-line no-undef -- it is
  console.log(__MONGO_URI__);
  // eslint-disable-next-line no-undef -- it is
  console.log(__MONGO_DB_NAME__);
  process.env.DB_CONN_STRING = getMongoURL();
  process.env.DB_NAME = getMongoDBName();
}

export async function getRawClient(): Promise<MongoClient> {
  return MongoClient.connect(getMongoURL());
}

export function getRawDb(client: MongoClient): Db {
  return client.db(getMongoDBName());
}

export function getMongoURL(): string {
  // Documentation is out of date :(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access -- sadly required
  return ((global as any).__MONGO_URI__ ?? process.env.MONGO_URL) as string;
}

export function getMongoDBName(): string {
  // Documentation is out of date :(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access -- sadly required
  return ((global as any).__MONGO_DB_NAME__ ?? "esp") as string;
}

export async function reset(coll: Collection): Promise<void> {
  await coll.deleteMany({});
}

export async function insertMany<T>(
  collection: Collection,
  input: OptionalId<T>[],
): Promise<T[]> {
  const res = await collection.insertMany(toMongo(input) as OptionalId<T>[]);
  return input.map((e, i) => {
    return { ...e, _id: new ObjectId(res.insertedIds[i].toString()) };
  }) as T[];
}
