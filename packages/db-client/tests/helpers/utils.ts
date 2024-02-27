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
  // eslint-disable-next-line no-undef -- it is
  return __MONGO_URI__;
}

export function getMongoDBName(): string {
  // eslint-disable-next-line no-undef -- it is
  return __MONGO_DB_NAME__;
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
