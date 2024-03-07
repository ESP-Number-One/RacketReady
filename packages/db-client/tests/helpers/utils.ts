import type { Collection, Db, OptionalId } from "mongodb";
import { MongoClient } from "mongodb";
import { ObjectId } from "@esp-group-one/types";
import { toMongo } from "../../src/types.js";
import { getMongoURL, getMongoDBName } from "./setup.js";

export async function getRawClient(): Promise<MongoClient> {
  return MongoClient.connect(getMongoURL());
}

export function getRawDb(client: MongoClient): Db {
  return client.db(getMongoDBName());
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
