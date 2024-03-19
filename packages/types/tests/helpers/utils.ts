import moment from "moment";
import type { ID } from "../../src/utils.js";
import { ObjectId, Sport } from "../../src/utils.js";
import type { Match, Scores } from "../../src/match.js";
import { MatchStatus } from "../../src/match.js";
import type { Availability, User, UserIdMap } from "../../src/user.js";
import { AbilityLevel } from "../../src/user.js";
import type { League } from "../../src/league.js";

export const IDS: ID[] = ["a", "b", "c", "d", "e"].map((x) => x.repeat(24));
export const OIDS: ObjectId[] = IDS.map((id) => new ObjectId(id));

export const PICTURES = [
  "UklGRq4EAABXRUJQVlA4IKIEAADwFACdASpQAFAAPo0+l0elI6IhK5jueKARiWwAxJnM/t3WjdS7d+Svs72vvHhOtunzvnoN3mT0AOmMrrDFMz5qgnIjg5X5NU8en1jv+/3J9kBUPMpda97E6afBMZKb2VT+qwcQx8Krz15p3EsgHLRti6oRVNTSF1InHGtuJRkp1YRwpk+44SVG6vs9Cx+FVOeqCWGGW/Us618Ii8vG64RefW22eOaIPjcX974jOP8wgAD+9oEXVAN8nHycfmdeB6pr8BBFeIxz7n7p6gdOJyHMvPLRjiuCBFhYVvi67EonqyeCnMxjLHhdZBZXU79Nw5Tx7NpeHJlbhKPQtV3Sinjvm4HU0Y6Ywsci4rW+j47pMuASolAUx2kuc1EhojTwNlVwWUnBkvyAOfKlei2+oQuDWSK+zxmK4VBpgJIbzSYGMbmXljmyA8pmIMGu7hdPsUEnZf8h638IgkFyJZ+qpIeAI0oBPbExIt9PgGsoMGqQ5XAcw441xcHxeYv4naK77l3KOsun2oG0XnFLB1x+/j/g3ziBpw/U+dEPGRhHN07XARVK+sRqFyncSbiIxQVzzkKwKW8Q7yq5HIhwhUqvIDS7ERiTxZFssSS15c5WYdg/EvFfZ/AyNyfiIRxGf2FTJUmYzLcZaZCphTDQAsofJS0stt9QPbWYRBTt7O9t6O9N+wUSmuIDGJeZ9NyvveMPTJL1ccn85Oyco1uxnayi4aJYyVG9yDrkUd+msRaXI8q/CuenJY5BTJAvpP+B5qqXMSv0ttWHFYP2Po3cLVkmMJ6PTSjVhRvYU2bKdT5nMT73tOfVwz2aqIPVfo3IeW6m2cya7bxdVVW1Y9D7tvDqru8WAwJjmrC4DpgTss2V3AeWbzTWm2mTbRPpHIAoNhLe7IXHlmcJHayXVTvffloAdfYQqjkm9SdpHgiqqfonO81r1IIqliBQls9JgpUA28juiX68SLIOLB+fQXUl9efkUdwbjVZ7Dd18LOH98pD/hKEUpKZi4EkqEumT62v3N2RZF5c59PPaiT9RWmXGYZXIigTqsMjV8nXdQSc8h8WxdU7dH1/4BtqPpiqUzoXYACFTK3xSlyZnPDeZHlykasVQaG/Fu+VH5uLGZfX/c17Ijaw4gm8zqShS1EQqXzeBtB/46bEA9YA7WfsFOB7n2MiBZuqhNzqcQV9nf5yN12K/SJb512v2/BnGQ02s1DBGfSjuuZMcPthIH+/6pXOkKUeUPIZgYWiAVng8tmaMlBl34ciOsALoJ7Kr5jOOdmJw8I8wuEKMx1vUWHWX9PGqVGiXwXO8KygYyVlyCuysp6IBjHlMXrMofyKbJbWvV1l83nKhPm+A0RwN76M97/OVXIyoWovqcY07GYwxnfbXbCF35ysajTGxtTSzViryP31PTfvLSDQT5yl+jtf5jQs8v8GzSZqyq8ArDgTElJRn5hXsD3zZPhWdhxeD2FvkC47Lt3WELRy+n71+Yf8mQ/FFtPt3UBl7vjLQ95Ja6p2eaHd8c99a3ox6d/PaGhgNIoJSYNARn+t15YAK5+hykqyRZf9qyTvXcht5n4ha7gvq7ed7SLuAAAAA",
];

export function getAvailability(inp: Partial<Availability>): Availability {
  const start = inp.timeStart ?? moment().toISOString();

  return {
    timeStart: start,
    timeEnd: inp.timeEnd ?? moment(start).add(2, "hours").toISOString(),
    recurring: "recurring" in inp ? inp.recurring : { days: 1 },
  };
}

export function getLeague(obj: Partial<League>): League {
  const base = {
    _id: obj._id ?? new ObjectId(IDS[0]),
    name: obj.name ?? "My custom League",
    sport: obj.sport ?? Sport.Squash,
    ownerIds: obj.ownerIds ?? [new ObjectId(IDS[1])],
    round: obj.round ?? 0,
    picture: null,
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
  const players = obj.players ?? [new ObjectId(IDS[0]), new ObjectId(IDS[1])];
  const base = {
    _id: obj._id ?? new ObjectId(IDS[0]),
    date: obj.date ?? moment().toISOString(),
    messages: obj.messages ?? [],
    owner: obj.owner ?? players[0],
    players,
    sport: obj.sport ?? Sport.Squash,
  };

  let match: Match;

  if (obj.status === MatchStatus.Complete) {
    const score: Scores = obj.score ?? {};
    if (!obj.score) {
      score[players[0].toString()] = 10;
      if (players.length > 1) {
        score[players[1].toString()] = 5;
      }
    }

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
    profilePicture: obj.profilePicture ?? PICTURES[0],
    email: obj.email ?? "test@test.ts",
    sports: obj.sports ?? [
      { sport: Sport.Tennis, ability: AbilityLevel.Beginner },
      { sport: Sport.Squash, ability: AbilityLevel.Advanced },
    ],
    leagues: obj.leagues ?? [new ObjectId(IDS[1])],
    availability: obj.availability ?? [],
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
