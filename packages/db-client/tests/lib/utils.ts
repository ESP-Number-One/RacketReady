import type { Collection, Db, OptionalId } from "mongodb";
import { MongoClient } from "mongodb";
import { ObjectId } from "@esp-group-one/types";
import { toMongo } from "../../src/types.js";

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
  // Documentation is out of date :(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access -- sadly required
  return ((global as any).__MONGO_URI___ ?? process.env.MONGO_URL) as string;
}

export function getMongoDBName(): string {
  // Documentation is out of date :(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access -- sadly required
  return ((global as any).__MONGO_DB_NAME__ ?? "esp") as string;
}

export async function reset(collection: string): Promise<void> {
  const db = getRawDb(await getRawClient());
  await db.collection(collection).deleteMany({});
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
