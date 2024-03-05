import type {
  ID,
  Match,
  MatchProposal,
  MatchQuery,
  PageOptions,
  Scores,
  User,
} from "@esp-group-one/types";
import { MatchStatus, ObjectId, Sport, tests } from "@esp-group-one/types";
import { describe, expect, test } from "@jest/globals";
import { addCommonTests, setup, withDb } from "../helpers/controller.js";
import {
  addMatch,
  addUser,
  expectAPIRes,
  requestWithAuth,
} from "../helpers/utils.js";
import { app } from "../../src/app.js";

const { IDS } = tests;

setup();

jest.mock("access-token-jwt");

const creationStartDate = new Date().toString();

const auth0Id = "github|111112";
let user: User;
let opponent: User;

beforeEach(async () => {
  await withDb(async (db) => {
    user = await addUser(db, auth0Id);
    opponent = await addUser(db, auth0Id);
  });
});

describe("accept", () => {
  test("done", async () => {
    await withDb(async (db) => {
      const match = await addMatch(db, {
        status: MatchStatus.Request,
        players: [user._id, new ObjectId(IDS[0])],
      });
      const res = await requestWithAuth(app, auth0Id)
        .post(`/match/${match._id.toString()}/accept`)
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        success: true,
      });

      const matches = await db.matches();
      const updateMatch = await matches.get(match._id);
      expect(updateMatch?.status).toBe(MatchStatus.Accepted);
    });
  });

  test("match already accepted", async () => {
    await withDb(async (db) => {
      const match = await addMatch(db, {
        status: MatchStatus.Accepted,
        players: [user._id, new ObjectId(IDS[0])],
      });

      const res = await requestWithAuth(app, auth0Id)
        .post(`/match/${match._id.toString()}/accept`)
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual({
        success: false,
        error: "The match is already accepted",
      });
    });
  });

  test("match doesn't exist", async () => {
    const res = await requestWithAuth(app, auth0Id)
      .post(`/match/${IDS[0]}/accept`)
      .set("Authorization", "Bearer test_api_token");

    expect(res.statusCode).toBe(404);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });
  });

  test("user is owner", async () => {
    await withDb(async (db) => {
      const match = await addMatch(db, {
        status: MatchStatus.Accepted,
        players: [user._id, new ObjectId(IDS[0])],
        owner: user._id,
      });

      const res = await requestWithAuth(app, auth0Id)
        .post(`/match/${match._id.toString()}/accept`)
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(404);
      expect(res.body).toStrictEqual({
        success: false,
        error: "Failed to get obj",
      });
    });
  });

  test("user not in players", async () => {
    await withDb(async (db) => {
      const match = await addMatch(db, {
        status: MatchStatus.Accepted,
        players: [new ObjectId(IDS[0]), new ObjectId(IDS[1])],
      });

      const res = await requestWithAuth(app, auth0Id)
        .post(`/match/${match._id.toString()}/accept`)
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(404);
      expect(res.body).toStrictEqual({
        success: false,
        error: "Failed to get obj",
      });
    });
  });
});

describe("complete", () => {
  test("success", async () => {
    await withDb(async (db) => {
      const match = await addMatch(db, {
        status: MatchStatus.Accepted,
        players: [user._id, opponent._id],
      });

      const scores: Scores = newScores([
        [user._id.toString(), 10],
        [opponent._id.toString(), 5],
      ]);

      const res = await requestWithAuth(app, auth0Id)
        .post(`/match/${match._id.toString()}/complete`)
        .send(scores)
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        success: true,
      });

      const matches = await db.matches();
      const updateMatch = await matches.get(match._id);
      expect(updateMatch?.status).toBe(MatchStatus.Complete);
      if (updateMatch?.status === MatchStatus.Complete) {
        expect(updateMatch.score).toStrictEqual(scores);
      }
    });
  });

  test("doesn't exist", async () => {
    const scores: Scores = newScores([
      [user._id.toString(), 10],
      [IDS[0], 5],
    ]);
    const res = await requestWithAuth(app, auth0Id)
      .post(`/match/${IDS[1]}/complete`)
      .send(scores)
      .set("Authorization", "Bearer test_api_token");

    expect(res.statusCode).toBe(404);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });
  });

  test("not in players", async () => {
    await withDb(async (db) => {
      const match = await addMatch(db, {
        status: MatchStatus.Accepted,
      });

      const scores: Scores = newScores([
        [user._id.toString(), 10],
        [opponent._id.toString(), 5],
      ]);

      const res = await requestWithAuth(app, auth0Id)
        .post(`/match/${match._id.toString()}/complete`)
        .send(scores)
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(404);
      expect(res.body).toStrictEqual({
        success: false,
        error: "Failed to get obj",
      });
    });
  });

  describe("not in accepting state", () => {
    [MatchStatus.Complete, MatchStatus.Request].forEach((status) => {
      test(status.toString(), async () => {
        await withDb(async (db) => {
          const match = await addMatch(db, {
            status,
            players: [user._id, opponent._id],
          });

          const scores: Scores = newScores([
            [user._id.toString(), 10],
            [opponent._id.toString(), 5],
          ]);

          const res = await requestWithAuth(app, auth0Id)
            .post(`/match/${match._id.toString()}/complete`)
            .send(scores)
            .set("Authorization", "Bearer test_api_token");

          expect(res.statusCode).toBe(400);
          expect(res.body).toStrictEqual({
            success: false,
            error: "The match is not in accepted state",
          });
        });
      });
    });
  });

  test("before completion date", async () => {
    await withDb(async (db) => {
      const match = await addMatch(db, {
        status: MatchStatus.Accepted,
        players: [user._id, opponent._id],
        date: new Date(Date.now() + 12096e5).toString(),
      });

      const scores: Scores = newScores([
        [user._id.toString(), 10],
        [opponent._id.toString(), 5],
      ]);

      const res = await requestWithAuth(app, auth0Id)
        .post(`/match/${match._id.toString()}/complete`)
        .send(scores)
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual({
        success: false,
        error: "The match has not started",
      });
    });
  });

  describe("invalid scores", () => {
    test("duplicate players", async () => {
      await withDb(async (db) => {
        const match = await addMatch(db, {
          status: MatchStatus.Accepted,
          players: [user._id, opponent._id],
        });

        const scores: Scores = newScores([
          [user._id.toString(), 10],
          [user._id.toString(), 5],
        ]);

        const res = await requestWithAuth(app, auth0Id)
          .post(`/match/${match._id.toString()}/complete`)
          .send(scores)
          .set("Authorization", "Bearer test_api_token");

        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({
          success: false,
          error: "The number of scores + players does not match",
        });
      });
    });

    test("with players not in match", async () => {
      await withDb(async (db) => {
        const match = await addMatch(db, {
          status: MatchStatus.Accepted,
          players: [user._id, opponent._id],
        });

        const scores: Scores = newScores([
          [user._id.toString(), 10],
          [IDS[1], 5],
        ]);

        const res = await requestWithAuth(app, auth0Id)
          .post(`/match/${match._id.toString()}/complete`)
          .send(scores)
          .set("Authorization", "Bearer test_api_token");

        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({
          success: false,
          error: "The number of scores + players does not match",
        });
      });
    });

    test("with less players", async () => {
      await withDb(async (db) => {
        const match = await addMatch(db, {
          status: MatchStatus.Accepted,
          players: [user._id, opponent._id],
        });

        const scores: Scores = newScores([[user._id.toString(), 10]]);

        const res = await requestWithAuth(app, auth0Id)
          .post(`/match/${match._id.toString()}/complete`)
          .send(scores)
          .set("Authorization", "Bearer test_api_token");

        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({
          success: false,
          error: "The number of scores + players does not match",
        });
      });
    });
  });
});

describe("new", () => {
  test("with yourself", async () => {
    const res = await requestWithAuth(app, auth0Id)
      .post("/match/new")
      .send(getMatchProposal({ to: user._id }))
      .set("Authorization", "Bearer test_api_thing");

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      success: false,
      error: "You cannot propose a match with yourself!",
    });
  });

  test("invalid time string", async () => {
    const res = await requestWithAuth(app, auth0Id)
      .post("/match/new")
      .send(getMatchProposal({ date: "1982374121897236187" }))
      .set("Authorization", "Bearer test_api_thing");

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      error: "Invalid date",
      success: false,
    });
  });

  test("opponent doesn't exist", async () => {
    const res = await requestWithAuth(app, auth0Id)
      .post("/match/new")
      .send(getMatchProposal({ to: new ObjectId(IDS[0]) }))
      .set("Authorization", "Bearer test_api_thing");

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      error: "You cannot propose a match with a non-existent user!",
      success: false,
    });
  });

  describe("with league", () => {
    test("user in league", async () => {
      await withDb(async (db) => {
        const users = await db.users();
        await users.edit(user._id, {
          $set: { leagues: [new ObjectId(IDS[1])] },
        });
      });

      const res = await requestWithAuth(app, auth0Id)
        .post("/match/new")
        .send(getMatchProposal({ league: new ObjectId(IDS[1]), round: 0 }))
        .set("Authorization", "Bearer test_api_thing");

      expect(res.status).toBe(201);
      expectAPIRes(res.body).toEqual({
        success: true,
        data: {
          _id: expect.any(ObjectId),
          date: creationStartDate,
          messages: [],
          owner: user._id,
          players: [user._id, opponent._id],
          sport: Sport.Tennis,
          status: MatchStatus.Request,
          league: new ObjectId(IDS[1]),
          round: 0,
        },
      });
    });

    test("user not in league", async () => {
      const res = await requestWithAuth(app, auth0Id)
        .post("/match/new")
        .send(getMatchProposal({ league: new ObjectId(IDS[0]), round: 0 }))
        .set("Authorization", "Bearer test_api_thing");

      expect(res.status).toBe(400);
      expectAPIRes(res.body).toEqual({
        success: false,
        error: "You must be in the league to create a match",
      });
    });
  });
});

describe("get", () => {
  test("not your match", async () => {
    await withDb(async (db) => {
      const match = await addMatch(db);
      const res = await requestWithAuth(app, auth0Id)
        .get(`/match/${match._id.toString()}`)
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(404);
      expect(res.body).toStrictEqual({
        success: false,
        error: "Failed to get obj",
      });
    });
  });
});

describe("find/proposed", () => {
  test("general", async () => {
    await withDb(async (db) => {
      const matches: Match[] = [];
      matches.push(
        await addMatch(db, {
          status: MatchStatus.Accepted,
          owner: user._id,
          players: [user._id, new ObjectId(IDS[0])],
        }),
      );

      matches.push(
        await addMatch(db, {
          status: MatchStatus.Accepted,
          owner: new ObjectId(IDS[0]),
          players: [user._id, new ObjectId(IDS[0])],
        }),
      );

      matches.push(
        await addMatch(db, {
          status: MatchStatus.Accepted,
          owner: new ObjectId(IDS[0]),
          players: [new ObjectId(IDS[0]), new ObjectId(IDS[1])],
        }),
      );

      const res = await requestWithAuth(app, auth0Id)
        .post(`/match/find/proposed`)
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(200);
      expectAPIRes(res.body).toStrictEqual({
        success: true,
        data: [matches[1]],
      });
    });
  });
});

describe("find", () => {
  test("not your match", async () => {
    await withDb(async (db) => {
      await addMatch(db);
      const res = await requestWithAuth(app, auth0Id)
        .post(`/match/find`)
        .send({})
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        success: true,
        data: [],
      });
    });
  });

  test("with query", async () => {
    await withDb(async (db) => {
      const expected = await addMatch(db, {
        status: MatchStatus.Accepted,
        owner: user._id,
        players: [user._id, new ObjectId(IDS[0])],
      });
      await addMatch(db);
      const res = await requestWithAuth(app, auth0Id)
        .post(`/match/find`)
        .send({
          query: { status: MatchStatus.Accepted },
        } as PageOptions<MatchQuery>)
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(200);
      expectAPIRes(res.body).toStrictEqual({
        success: true,
        data: [expected],
      });
    });
  });
});

describe("rate", () => {
  test("done", async () => {
    await withDb(async (db) => {
      const users = await db.users();
      await users.edit(user._id, {
        $set: { rating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
      });
      await users.edit(opponent._id, {
        $set: { rating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
      });

      const match = await addMatch(db, {
        status: MatchStatus.Complete,
        players: [user._id, opponent._id],
      });
      const res = await requestWithAuth(app, auth0Id)
        .post(`/match/${match._id.toString()}/rate`)
        .send({ stars: 5 })
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        success: true,
      });

      const matches = await db.matches();
      const updateMatch = await matches.get(match._id);
      expect(updateMatch?.status).toBe(MatchStatus.Complete);
      if (updateMatch?.status === MatchStatus.Complete) {
        expect(updateMatch.usersRated).toStrictEqual([user._id]);
      }

      const updateUser = await users.get(user._id);
      expect(updateUser?.rating).toStrictEqual({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      });

      const updateOpponent = await users.get(opponent._id);
      expect(updateOpponent?.rating).toStrictEqual({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 1,
      });
    });
  });

  test("match not completed", async () => {
    await withDb(async (db) => {
      const match = await addMatch(db, {
        status: MatchStatus.Accepted,
        players: [user._id, new ObjectId(IDS[0])],
      });

      const res = await requestWithAuth(app, auth0Id)
        .post(`/match/${match._id.toString()}/rate`)
        .send({ stars: 5 })
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual({
        success: false,
        error: "The match has not completed",
      });
    });
  });

  test("match already rated", async () => {
    await withDb(async (db) => {
      const match = await addMatch(db, {
        status: MatchStatus.Complete,
        players: [user._id, new ObjectId(IDS[0])],
        usersRated: [user._id],
      });

      const res = await requestWithAuth(app, auth0Id)
        .post(`/match/${match._id.toString()}/rate`)
        .send({ stars: 5 })
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual({
        success: false,
        error: "You have already rated the match!",
      });
    });
  });

  test("match doesn't exist", async () => {
    const res = await requestWithAuth(app, auth0Id)
      .post(`/match/${IDS[0]}/rate`)
      .send({ stars: 5 })
      .set("Authorization", "Bearer test_api_token");

    expect(res.statusCode).toBe(404);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });
  });

  test("user not in players", async () => {
    await withDb(async (db) => {
      const match = await addMatch(db, {
        status: MatchStatus.Complete,
        players: [new ObjectId(IDS[0]), new ObjectId(IDS[1])],
      });

      const res = await requestWithAuth(app, auth0Id)
        .post(`/match/${match._id.toString()}/rate`)
        .send({ stars: 5 })
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(404);
      expect(res.body).toStrictEqual({
        success: false,
        error: "Failed to get obj",
      });
    });
  });
});

addCommonTests({
  prefix: "/match",
  getCreation: () => getMatchProposal({}),
  skipNewExists: true,
  addObj: (db, _, creation) => addMatch(db, creation),
  addCensoredObj: (db, currUser) =>
    addMatch(db, { players: [currUser._id, opponent._id] }),
  validateCreation: async (db, currUser) => {
    const coll = await db.matches();
    const res = await coll.find({});
    expect(res).toStrictEqual([
      {
        _id: expect.any(ObjectId),
        date: creationStartDate,
        messages: [],
        owner: currUser._id,
        players: [currUser._id, opponent._id],
        sport: Sport.Tennis,
        status: MatchStatus.Request,
      },
    ]);
  },
});

function getMatchProposal(inp: Partial<MatchProposal>): MatchProposal {
  const base: MatchProposal = {
    date: inp.date ?? creationStartDate,
    to: inp.to ?? opponent._id,
    sport: inp.sport ?? Sport.Tennis,
  };

  if ("league" in inp || "round" in inp) {
    return {
      ...base,
      league: inp.league ?? new ObjectId(IDS[0]),
      round: inp.round ?? 0,
    };
  }

  return base;
}

function newScores(scores: [ID, number][]): Scores {
  return Object.fromEntries(scores);
}