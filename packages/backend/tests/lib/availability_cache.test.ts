import { describe, expect, it } from "@jest/globals";
import moment from "moment";
import type { AvailabilityCache, Duration } from "@esp-group-one/types";
import { ObjectId } from "@esp-group-one/types";
import {
  OIDS,
  TestDb,
  getAvailability,
  setupAvailability,
  stopTime,
} from "@esp-group-one/test-helpers";
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
    await setupAvailability(db.get());
    const result = await getAvailabilityCache(db.get(), OIDS[0]);
    expect(result).toEqual([]); // Expect an empty array
  });

  it("acts as expected", async () => {
    const currUserId = OIDS[0];
    const users = OIDS.slice(1);
    await setupAvailability(db.get(), [
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
    await setupAvailability(db.get(), [
      [currUserId, users[0]],
      [users[0], users[1]],
      [currUserId, users[0]],
    ]);
    const result = await getAvailabilityCache(db.get(), currUserId);
    expect(result).toEqual([users[0]]);
  });

  it("does not return the current user", async () => {
    const currUserId = OIDS[0];
    await setupAvailability(db.get(), [[currUserId]]);
    const result = await getAvailabilityCache(db.get(), currUserId);
    const stringResult = result.map((id) => id.toString());
    expect(stringResult).not.toContain(currUserId.toString());
  });
});

describe("setAvailabilityCache", () => {
  it("should set availability cache", async () => {
    await setupAvailability(db.get());
    const currUserId = OIDS[0];

    const day = moment().startOf("hour");
    const availabilityForTwoWeeks: AvailabilityCache[] = [
      {
        _id: expect.any(ObjectId) as unknown as ObjectId,
        start: day.toISOString(),
        availablePeople: [currUserId],
      },
      {
        _id: expect.any(ObjectId) as unknown as ObjectId,
        start: day.clone().add(1, "hour").toISOString(),
        availablePeople: [currUserId],
      },
    ];

    await setAvailabilityCache(
      db.get(),
      currUserId,
      getAvailability({ recurring: undefined }),
    );

    const collection = await db.get().availabilityCaches();
    const result = await collection.find({ availablePeople: currUserId });

    expect(result).toStrictEqual(availabilityForTwoWeeks);
  });

  describe("reoccurring", () => {
    const myTests = {
      days: 14,
      weeks: 2,
      months: 1,
      years: 1,
    };

    Object.entries(myTests).forEach(([period, amount]) => {
      test(period, async () => {
        await setupAvailability(db.get());
        const currUserId = OIDS[0];

        let day = moment().startOf("hour");
        const availabilityForTwoWeeks: AvailabilityCache[] = [];

        for (let i = 0; i < amount; i++) {
          availabilityForTwoWeeks.push(
            {
              _id: expect.any(ObjectId) as unknown as ObjectId,
              start: day.toISOString(),
              availablePeople: [currUserId],
            },
            {
              _id: expect.any(ObjectId) as unknown as ObjectId,
              start: day.clone().add(1, "hour").toISOString(),
              availablePeople: [currUserId],
            },
          );

          day = day.add(1, period as moment.unitOfTime.DurationConstructor);
        }

        const recurring: Duration = {};
        recurring[period as "days" | "weeks" | "months" | "years"] = 1;

        await setAvailabilityCache(
          db.get(),
          currUserId,
          getAvailability({ recurring }),
        );

        const collection = await db.get().availabilityCaches();
        const result = await collection.find({ availablePeople: currUserId });

        expect(result).toStrictEqual(availabilityForTwoWeeks);
      });
    });
  });
});
