import { describe, expect, test } from "@jest/globals";
import { getRawClient, setup } from "./lib/utils.js";
import { DbClient } from "../src/client.js";
import {
  LEAGUE_COLLECTION_NAME,
  MATCH_COLLECTION_NAME,
  USER_COLLECTION_NAME,
  USER_MAP_COLLECTION_NAME,
} from "../src/constants.js";
import { League, Match, User, UserIdMap, tests } from "@esp-group-one/types";
import { Document, OptionalId } from "mongodb";
import { toMongo } from "../src/types.js";

const { getLeague, getMatch, getUser, getUserIdMap } = tests;

setup();

describe("collections", () => {
  test("leagues", async () => {
    const rawColl = (await getRawClient())
      .db()
      .collection(LEAGUE_COLLECTION_NAME);

    const league: OptionalId<League> = getLeague({});
    rawColl.insertOne(toMongo(league) as OptionalId<Document>);

    const db = new DbClient();
    const coll = await db.leagues();

    expect(coll.find({})).toBe([league]);
  });

  test("matches", async () => {
    const rawColl = (await getRawClient())
      .db()
      .collection(MATCH_COLLECTION_NAME);

    const match: OptionalId<Match> = getMatch({});
    rawColl.insertOne(toMongo(match) as OptionalId<Document>);

    const db = new DbClient();
    const coll = await db.matches();

    expect(coll.find({})).toBe([match]);
  });

  test("users", async () => {
    const rawColl = (await getRawClient())
      .db()
      .collection(USER_COLLECTION_NAME);

    const user: OptionalId<User> = getUser({});
    rawColl.insertOne(toMongo(user) as OptionalId<Document>);

    const db = new DbClient();
    const coll = await db.users();

    expect(coll.find({})).toBe([user]);
  });

  test("userMap", async () => {
    const rawColl = (await getRawClient())
      .db()
      .collection(USER_MAP_COLLECTION_NAME);

    const userIdMap: OptionalId<UserIdMap> = getUserIdMap({});
    rawColl.insertOne(toMongo(userIdMap) as OptionalId<Document>);

    const db = new DbClient();
    const coll = await db.userMap();

    expect(coll.find({})).toBe([userIdMap]);
  });
});
