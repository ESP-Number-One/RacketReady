import type { DbClient } from "@esp-group-one/db-client";
import type {
  AvailabilityCache,
  League,
  Match,
  ObjectId,
  User,
} from "@esp-group-one/types";
import { helpers as types } from "@esp-group-one/types";
import type { Moment } from "moment";
import moment from "moment";
import type { OptionalId } from "mongodb";

export async function addUser(
  db: DbClient,
  auth0Id = "github|123456",
  base: Partial<User> = {},
): Promise<User> {
  const user: OptionalId<User> = types.getUser(base);
  delete user._id;
  const insert = await (await db.users()).insert(user);
  const u: User = { ...user, _id: insert[0] };

  await (await db.userMap()).insert({ auth0Id, internalId: u._id });

  return u;
}

export async function addLeague(
  db: DbClient,
  base: Partial<League> = {},
): Promise<League> {
  const league: OptionalId<League> = types.getLeague(base);
  delete league._id;
  const insert = await (await db.leagues()).insert(league);
  const l: League = { ...league, _id: insert[0] };

  return l;
}

export async function addMatch(
  db: DbClient,
  base: Partial<Match> = {},
): Promise<Match> {
  const match: OptionalId<Match> = types.getMatch(base);
  delete match._id;
  const insert = await (await db.matches()).insert(match);
  const m: Match = { ...match, _id: insert[0] };

  return m;
}

export async function resetCollections(db: DbClient): Promise<void> {
  const collections = await (await db.raw()).collections();
  const promises = [];
  for (const c of collections) {
    promises.push(c.deleteMany());
  }
  await Promise.all(promises);
}

/**
 * Sets up the availability cache setting the first couple of hours to the
 * given 2d array of object ids
 */
export async function setupAvailability(
  db: DbClient,
  origin: ObjectId[][] = [],
  start?: Moment,
) {
  const coll = await db.availabilityCaches();
  const twoWeeksFromNow = moment().add(2, "weeks");
  const times: OptionalId<AvailabilityCache>[] = [];
  const currTime = moment().startOf("hour");

  while (currTime.isBefore(twoWeeksFromNow)) {
    const availablePeople =
      !start || currTime.isAfter(start) ? origin.shift() ?? [] : [];
    times.push({
      start: currTime.toISOString(),
      availablePeople,
    });
    currTime.add(1, "hour");
  }

  await coll.insert(...times);
}
