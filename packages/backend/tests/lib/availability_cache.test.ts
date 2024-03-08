import { describe, expect, it } from "@jest/globals";
import moment from "moment";
import type { Availability, AvailabilityCache } from "@esp-group-one/types";
import { ObjectId } from "@esp-group-one/types";
import type { OptionalId } from "mongodb";
import { OIDS, TestDb, stopTime } from "@esp-group-one/test-helpers";
import {
  getAvailabilityCache,
  setAvailabilityCache,
} from "../../src/lib/availability_cache.js";

// So mongodb doesn't complain
const db = new TestDb();

beforeAll(() => {
  stopTime();
});

describe("getAvailabilityCache", () => {
  it("should handle a user that doesn't have common availabilities", async () => {
    await setupAvailability();
    const result = await getAvailabilityCache(db.get(), OIDS[0]);
    expect(result).toEqual([]); // Expect an empty array
  });

  it("acts as expected", async () => {
    const currUserId = OIDS[0];
    const users = OIDS.slice(1);
    await setupAvailability([
      [currUserId, users[0]],
      [users[0], users[1]],
      [currUserId, users[1]],
    ]);
    const result = await getAvailabilityCache(db.get(), currUserId);
    expect(result).toEqual([users[0], users[1]]);
  });

  it("removes duplicates over multiple times", async () => {
    const currUserId = OIDS[0];
    const users = OIDS.slice(1);
    await setupAvailability([
      [currUserId, users[0]],
      [users[0], users[1]],
      [currUserId, users[0]],
    ]);
    const result = await getAvailabilityCache(db.get(), currUserId);
    expect(result).toEqual([users[0]]);
  });

  it("does not return the current user", async () => {
    const currUserId = OIDS[0];
    await setupAvailability([[currUserId]]);
    const result = await getAvailabilityCache(db.get(), currUserId);
    const stringResult = result.map((id) => id.toString());
    expect(stringResult).not.toContain(currUserId.toString());
  });
});

describe("setAvailabilityCache", () => {
  it("should set availability cache", async () => {
    await setupAvailability();
    const currUserId = OIDS[0];

    let day = moment().startOf("hour");
    const availabilityForTwoWeeks: AvailabilityCache[] = [];

    for (let i = 0; i < 14; i++) {
      const availabilityForDay: AvailabilityCache = {
        _id: expect.any(ObjectId) as unknown as ObjectId,
        start: day.toISOString(),
        availablePeople: [currUserId],
      };
      const availabilityForDay2: AvailabilityCache = {
        _id: expect.any(ObjectId) as unknown as ObjectId,
        start: day.clone().add(1, "hour").toISOString(),
        availablePeople: [currUserId],
      };
      availabilityForTwoWeeks.push(availabilityForDay, availabilityForDay2);
      day = day.add(1, "day");
    }

    await setAvailabilityCache(db.get(), currUserId, getAvailability({}));

    const collection = await db.get().availabilityCaches();
    const result = await collection.find({ availablePeople: currUserId });

    expect(result).toStrictEqual(availabilityForTwoWeeks);
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
  const coll = await db.get().availabilityCaches();
  const twoWeeksFromNow = moment().add(2, "weeks");
  const times: OptionalId<AvailabilityCache>[] = [];
  const currTime = moment().startOf("hour");
  while (currTime.isBefore(twoWeeksFromNow)) {
    times.push({
      start: currTime.toISOString(),
      availablePeople: fill.shift() ?? [],
    });
    currTime.add(1, "hour");
  }
  await coll.insert(...times);
}
