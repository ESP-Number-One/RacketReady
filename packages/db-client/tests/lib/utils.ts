import { Collection, Db, MongoClient, OptionalId } from "mongodb";
import { toMongo } from "../../src/types.js";
import { ObjectId } from "@esp-group-one/types";

export function setup() {
  console.log(getMongoURL());
  console.log(process.env["MONGO_DB_NAME"]);
  console.log(process.env["MONGO_URL"]);
  process.env["DB_CONN_STRING"] = getMongoURL();
  process.env["DB_NAME"] = getMongoDBName();
}

export async function getRawClient(): Promise<MongoClient> {
  return await MongoClient.connect(getMongoURL());
}

export function getRawDb(client: MongoClient): Db {
  return client.db(getMongoDBName());
}

export function getMongoURL(): string {
  // return "mongodb://localhost:27017";
  return (global as any).__MONGO_URI___ as string;
}

export function getMongoDBName(): string {
  return (global as any).__MONGO_DB_NAME__ as string;
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
