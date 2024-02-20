import type { Document, MongoClient, OptionalId } from "mongodb";
import type { League, Match, User, UserIdMap } from "@esp-group-one/types";
import { tests } from "@esp-group-one/types";
import { describe, expect, test } from "@jest/globals";
import { DbClient } from "../src/client.js";
import {
  LEAGUE_COLLECTION_NAME,
  MATCH_COLLECTION_NAME,
  USER_COLLECTION_NAME,
  USER_MAP_COLLECTION_NAME,
} from "../src/constants.js";
import { toMongo } from "../src/types.js";
import { getRawClient, getRawDb, setup } from "./lib/utils.js";

const { getLeague, getMatch, getUser, getUserIdMap } = tests;

let client: MongoClient;
beforeAll(async () => {
  setup();
  client = await getRawClient();
});

afterAll(async () => {
  await client.close();
});

describe("collections", () => {
  test("leagues", async () => {
    const rawColl = getRawDb(client).collection(LEAGUE_COLLECTION_NAME);

    const league: OptionalId<League> = getLeague({});
    await rawColl.insertOne(toMongo(league) as OptionalId<Document>);

    const db = new DbClient();
    const coll = await db.leagues();

    expect(await coll.find({})).toStrictEqual([league]);
  });

  test("matches", async () => {
    const rawColl = getRawDb(client).collection(MATCH_COLLECTION_NAME);

    const match: OptionalId<Match> = getMatch({});
    await rawColl.insertOne(toMongo(match) as OptionalId<Document>);

    const db = new DbClient();
    const coll = await db.matches();

    expect(await coll.find({})).toStrictEqual([match]);
  });

  test("users", async () => {
    const rawColl = getRawDb(client).collection(USER_COLLECTION_NAME);

    const user: OptionalId<User> = getUser({});
    await rawColl.insertOne(toMongo(user) as OptionalId<Document>);

    const db = new DbClient();
    const coll = await db.users();

    expect(await coll.find({})).toStrictEqual([user]);
  });

  test("userMap", async () => {
    const rawColl = getRawDb(client).collection(USER_MAP_COLLECTION_NAME);

    const userIdMap: OptionalId<UserIdMap> = getUserIdMap({});
    await rawColl.insertOne(toMongo(userIdMap) as OptionalId<Document>);

    const db = new DbClient();
    const coll = await db.userMap();

    expect(await coll.find({})).toStrictEqual([userIdMap]);
  });
});
