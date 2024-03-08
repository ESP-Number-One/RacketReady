import type { League } from "../src/league.js";
import type { Match, Scores } from "../src/match.js";
import { MatchStatus } from "../src/match.js";
import { AbilityLevel, type User, type UserIdMap } from "../src/user.js";
import type { ID } from "../src/utils.js";
import { ObjectId, Sport } from "../src/utils.js";

export const IDS: ID[] = [
  "aaaaaaaaaaaaaaaaaaaaaaaa",
  "bbbbbbbbbbbbbbbbbbbbbbbb",
  "cccccccccccccccccccccccc",
  "dddddddddddddddddddddddd",
];

export function getLeague(obj: Partial<League>): League {
  const base = {
    _id: obj._id ?? new ObjectId(IDS[0]),
    name: obj.name ?? "My custom League",
    sport: obj.sport ?? Sport.Squash,
    ownerIds: obj.ownerIds ?? [new ObjectId(IDS[1])],
  };

  if (obj.private) {
    return {
      ...base,
      private: true,
      inviteCode: obj.inviteCode ?? "something",
    };
  }
  return {
    ...base,
    private: false,
  };
}

export function getMatch(obj: Partial<Match>): Match {
  const base = {
    _id: obj._id ?? new ObjectId(IDS[0]),
    date: obj.date ?? new Date().toLocaleString(),
    messages: obj.messages ?? [],
    owner: obj.owner ?? new ObjectId(IDS[0]),
    players: obj.players ?? [new ObjectId(IDS[0]), new ObjectId(IDS[1])],
    sport: obj.sport ?? Sport.Squash,
  };

  let match: Match;

  if (obj.status === MatchStatus.Complete) {
    const score: Scores = {};
    score[IDS[0]] = 10;
    score[IDS[1]] = 5;
    match = {
      ...base,
      status: MatchStatus.Complete,
      usersRated: obj.usersRated ?? [],
      score,
    };
  } else {
    match = { ...base, status: obj.status ?? MatchStatus.Accepted };
  }

  if ("league" in obj || "round" in obj) {
    return {
      ...match,
      league: obj.league ?? new ObjectId(IDS[3]),
      round: obj.round ?? 1,
    };
  }

  return match;
}

export function getUser(obj: Partial<User>): User {
  return {
    _id: obj._id ?? new ObjectId(IDS[0]),
    name: obj.name ?? "Test bot",
    description: obj.description ?? "Tester9000",
    profilePicture: obj.profilePicture ?? "AAAAAAAA",
    email: obj.email ?? "test@test.ts",
    sports: obj.sports ?? [
      { sport: Sport.Tennis, ability: AbilityLevel.Beginner },
      { sport: Sport.Squash, ability: AbilityLevel.Advanced },
    ],
    leagues: obj.leagues ?? [new ObjectId(IDS[1])],
    availability: obj.availability ?? [
      {
        timeStart: new Date().toLocaleString(),
        timeEnd: new Date().toLocaleString(),
      },
    ],
    rating: obj.rating ?? { 1: 5, 2: 10, 3: 20, 4: 50, 5: 10 },
  };
}

export function getUserIdMap(obj: Partial<UserIdMap>): UserIdMap {
  return {
    _id: obj._id ?? new ObjectId(IDS[0]),
    internalId: obj.internalId ?? new ObjectId(IDS[0]),
    auth0Id: obj.auth0Id ?? IDS[0],
  };
}
