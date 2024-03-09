import type { DbClient } from "@esp-group-one/db-client";
import { ObjectId } from "@esp-group-one/types";
import type {
  Availability,
  AvailabilityCache,
  Duration,
} from "@esp-group-one/types";
import type { Moment } from "moment";
import moment from "moment";
import type { Filter } from "mongodb";

/**
 * Gets other users who are available at the same time
 *
 * @param client - The database client to use
 * @param userId - The user id to match against
 *
 * @returns a list of unique user ids of the other users
 */
export async function getAvailabilityCache(
  client: DbClient,
  userId: ObjectId,
): Promise<ObjectId[]> {
  const coll = await client.availabilityCaches();
  const res = await coll.find({ availablePeople: userId });

  const availablePeople = res.flatMap((x) => x.availablePeople);
  const uniqueAvailablePeople = Array.from(
    new Set(availablePeople.map(String).filter((x) => x !== userId.toString())),
  );

  return uniqueAvailablePeople.map((x) => new ObjectId(x));
}

/**
 * Updates the availability cache with a given availability object
 *
 * @param db - The database client to use
 * @param userId - The user id to set for
 * @param availability - The availability to set the user to
 */
export async function setAvailabilityCache(
  db: DbClient,
  userId: ObjectId,
  availability: Availability,
): Promise<void> {
  const start = moment(availability.timeStart).startOf("hour");
  const end = moment(availability.timeEnd).startOf("hour");

  const duration = end.diff(start, "hours");
  const times = Array.from({ length: duration }, (_, i) =>
    start.clone().add(i, "hours"),
  );

  const twoWeeksFromStart = start.clone().add(2, "weeks");

  if (availability.recurring) {
    let lastTimes = [...times];
    // Get the time objects for the next two weeks
    while (lastTimes.length > 0) {
      lastTimes = lastTimes
        .map((time) =>
          addTime(time, availability.recurring as unknown as Duration),
        )
        .filter((time) => time < twoWeeksFromStart);
      times.push(...lastTimes);
    }
  }

  // Query : Start time in array AND available doesn't contain userId to
  // make sure duplicates don't occur
  const queries: Filter<AvailabilityCache>[] = [
    { availablePeople: { $not: { $eq: userId } } },
    { start: { $in: times.map((x) => x.toISOString()) } },
  ];
  const availabilityCache = await db.availabilityCaches();

  await availabilityCache.editWithQuery(
    { $and: queries },
    { $push: { availablePeople: userId } },
  );
}

function addTime(time: Moment, duration: Duration): Moment {
  let newTime = time.clone();

  if (duration.days) newTime = newTime.add(duration.days, "days");
  if (duration.weeks) newTime = newTime.add(duration.weeks, "weeks");
  if (duration.months) newTime = newTime.add(duration.months, "months");
  if (duration.years) newTime = newTime.add(duration.years, "years");

  return newTime;
}
