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

export async function setAvailabilityCache(
  db: DbClient,
  userId: ObjectId,
  availability: Availability,
): Promise<void> {
  // Availablity is an objeect with start and end time. For each one hour time slot in the availabilty return me an time object. All the time objects should be an array
  const start = moment(availability.timeStart).startOf("hour");
  const end = moment(availability.timeEnd).startOf("hour");
  //find the difference between start and end time
  const duration = end.diff(start, "hours");
  //create an array of time objects
  const times = Array.from({ length: duration }, (_, i) =>
    start.clone().add(i, "hours"),
  );

  const twoWeeksFromStart = start.clone().add(2, "weeks");

  //check if this has recursion
  if (availability.recurring) {
    let lastTimes = [...times];
    while (lastTimes.length > 0) {
      // use map and filter functions to get the time objects for the next two weeks
      lastTimes = lastTimes
        .map((time) =>
          addTime(time, availability.recurring as unknown as Duration),
        ) // TODO ADD recuring date time thing
        .filter((time) => time < twoWeeksFromStart);
      times.push(...lastTimes);
    }
    //Query : Start time in array AND available doesn't contain userId
    const queries: Filter<AvailabilityCache>[] = [
      { availablePeople: { $not: { $eq: userId } } },
      { start: { $in: times.map((x) => x.toISOString()) } },
    ];
    const availabilityCache = await db.availabilityCaches();
    // const curr = await availabilityCache.find({});
    // const currFilter = await availabilityCache.find({ $and: queries });
    // const currFilter2 = await availabilityCache.find(queries[1]);
    // console.log(curr);
    // console.log(currFilter);
    // console.log(currFilter2);
    await availabilityCache.editWithQuery(
      { $and: queries },
      { $push: { availablePeople: userId } },
    );
  }
}
function addTime(time: Moment, duration: Duration): Moment {
  let newTime = time.clone();
  if (duration.days) {
    newTime = newTime.add(duration.days, "days");
  }
  if (duration.weeks) {
    newTime = newTime.add(duration.weeks, "weeks");
  }
  if (duration.months) {
    newTime = newTime.add(duration.months, "months");
  }
  if (duration.years) {
    newTime = newTime.add(duration.years, "years");
  }
  return newTime;
}
