import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import * as db from "@esp-group-one/db-client";
import moment from "moment";
import {
  getAvailabilityCache,
  setAvailabilityCache,
} from "../../src/lib/availability_cache.js";
import {
  Availability,
  AvailabilityCache,
  ObjectId,
  tests,
} from "@esp-group-one/types";
import { resetCollections } from "../helpers/controller.js";
import { MongoClient, OptionalId } from "mongodb";

const { IDS } = tests;

// So mongodb doesn't complain
let client: db.DbClient;
let mongoClient: MongoClient;

beforeAll(async () => {
  db.tests.setup();
  mongoClient = await db.tests.getRawClient();
  client = new db.DbClient();
});

afterAll(async () => {
  await client.close();
});

beforeEach(async () => {
  await resetCollections(mongoClient);
});

describe("getAvailabilityCache", () => {
  it("should handle a user that doesn't have common availabilities", async () => {
    await setupAvailability();
    const result = await getAvailabilityCache(client, new ObjectId(IDS[0]));
    expect(result).toEqual([]); // Expect an empty array
  });

  it("acts as expected", async () => {
    await setupAvailability();
    const currUserId = new ObjectId(IDS[0]);
    const result = await getAvailabilityCache(client, currUserId);
    expect(result).toEqual([]);
  });

  it("removes duplicates over multiple times", async () => {
    
  });

  it("does not return the current user", async () => {
    const currUserId = new ObjectId(IDS[0]);
    await setupAvailability([[currUserId]]);
    const result = await getAvailabilityCache(client, currUserId);
    const stringResult = result.map((id) => id.toString());
    expect(stringResult).not.toContain(currUserId.toString());
  });

  // TODO: Remove as this is an example structure
  it("should get unique available people", async () => {
    const currUserId = new ObjectId(IDS[0]);
    const users = IDS.slice(1).map((id) => new ObjectId(id));
    await setupAvailability([
      [currUserId, users[0]],
      [users[0], users[1]],
      [currUserId, users[0]],
    ]);

    // TODO: Use client to set availability cache to return something
    const result = await getAvailabilityCache(client, currUserId);

    expect(result).toEqual([users[0]]);
  });
});

describe("setAvailabilityCache", () => {
  it("should set availability cache", async () => {
    const currUserId = new ObjectId(IDS[0]);
    await setAvailabilityCache(client, currUserId, getAvailability({}));
    // TODO: Query the database with client to see if the cache was changed
  });
});

function getAvailability(inp: Partial<Availability>): Availability {
  const start = inp.timeStart ?? moment().toISOString();

  return {
    timeStart: start,
    timeEnd: inp.timeEnd ?? moment(start).add(2, "hours").toISOString(),
    recurring: inp.recurring ?? { days: 1 },
  };
}

async function setupAvailability(origin?: ObjectId[][]) {
  const fill = origin ?? [];
  // Setup availability cache
  // Add { start: moment(some offset here).toISOString(), availablePeople: [] }
  // One for each hour for the next two weeks
  const coll = await client.availabilityCaches();
  const twoWeeksFromNow = moment().add(2, "weeks");
  const times: OptionalId<AvailabilityCache>[] = [];
  const currTime = moment();
  while (currTime.isBefore(twoWeeksFromNow)) {
    times.push({
      start: currTime.toISOString(),
      availablePeople: fill.shift() ?? [],
    });
    currTime.add(1, "hour");
  }
  await coll.insert(...times);
}
