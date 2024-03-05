import type { VerifyJwtResult } from "access-token-jwt";
import { jwtVerifier } from "access-token-jwt";
import type { DbClient } from "@esp-group-one/db-client";
import type { League, Match, MongoDBItem, User } from "@esp-group-one/types";
import { tests as typeTests, ObjectId } from "@esp-group-one/types";
import { expect } from "@jest/globals";
import type { OptionalId } from "mongodb";
import request from "supertest";
import type { App } from "supertest/types.js";
import { asFuncMock } from "./mock.js";

jest.mock("access-token-jwt");
const mockedJWTVerifier = asFuncMock(jwtVerifier);

const { getLeague, getMatch, getUser } = typeTests;

export function expectAPIRes<T>(inp: T) {
  return expect(ObjectId.fromObj(inp) as T);
}

export function requestWithAuth(pkg: App, auth0Id = "github|123456") {
  if (auth0Id !== "") {
    mockedJWTVerifier.mockReturnValue((__: string) => {
      return Promise.resolve({
        payload: { sub: auth0Id },
      } as VerifyJwtResult);
    });
  } else {
    mockedJWTVerifier.mockReturnValue((__: string) => {
      return Promise.reject(new Error("Invalid user"));
    });
  }
  return request(pkg);
}

export async function addUser(
  db: DbClient,
  auth0Id = "github|123456",
  base: Partial<User> = {},
): Promise<User> {
  const user: OptionalId<User> = getUser(base);
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
  const league: OptionalId<League> = getLeague(base);
  delete league._id;
  const insert = await (await db.leagues()).insert(league);
  const l: League = { ...league, _id: insert[0] };

  return l;
}

export async function addMatch(
  db: DbClient,
  base: Partial<Match> = {},
): Promise<Match> {
  const match: OptionalId<Match> = getMatch(base);
  delete match._id;
  const insert = await (await db.matches()).insert(match);
  const m: Match = { ...match, _id: insert[0] };

  return m;
}

export function idCmp<T extends MongoDBItem>(a: T, b: T): number {
  return a._id.mongoDbId.localeCompare(b._id.mongoDbId);
}

export function compareBag<T>(
  got: T[],
  expected: T[],
  cmp?: (a: T, b: T) => number,
) {
  expect(got.sort(cmp)).toStrictEqual(expected.sort(cmp));
}
