import type { LeagueCreation, User } from "@esp-group-one/types";
import { ObjectId, Sport, censorLeague, tests } from "@esp-group-one/types";
import { expect } from "@jest/globals";
import { generateRandomString } from "ts-randomstring/lib/index.js";
import { addCommonTests, setup, withDb } from "../helpers/controller.js";
import {
  addLeague,
  addUser,
  expectAPIRes,
  requestWithAuth,
} from "../helpers/utils.js";
import { app } from "../../src/app.js";

const { IDS } = tests;

setup();

jest.mock("access-token-jwt");

describe("get", () => {
  test("private league", async () => {
    await withDb(async (db) => {
      const league = await addLeague(db, { private: true });
      const auth0Id = "github|123456";
      const _ = await addUser(db, auth0Id);

      const res = await requestWithAuth(app, auth0Id)
        .get(`/league/${league._id.toString()}`)
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(404);
      expect(res.body).toStrictEqual({
        success: false,
        error: "Failed to get obj",
      });
    });
  });
});

describe("find", () => {
  const auth0Id = "github|123456";
  let user: User;

  beforeEach(async () => {
    user = await withDb((db) => addUser(db, auth0Id));
  });

  test("am in", async () => {
    await withDb(async (db) => {
      const expected = await addLeague(db, { name: "My league" });
      await addLeague(db, { name: "not my league" });
      await (
        await db.users()
      ).edit(user._id, { $set: { leagues: [expected._id] } });

      const res = await requestWithAuth(app, auth0Id)
        .post("/league/find")
        .send({ query: { amIn: true } })
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(200);
      expectAPIRes(res.body).toStrictEqual({
        success: true,
        data: [censorLeague(expected)],
      });
    });
  });

  test("am not in", async () => {
    await withDb(async (db) => {
      const notExpected = await addLeague(db, { name: "My league" });
      const expected = await addLeague(db, { name: "not my league" });
      await (
        await db.users()
      ).edit(user._id, { $set: { leagues: [notExpected._id] } });

      const res = await requestWithAuth(app, auth0Id)
        .post("/league/find")
        .send({ query: { amIn: false } })
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(200);
      expectAPIRes(res.body).toStrictEqual({
        success: true,
        data: [censorLeague(expected)],
      });
    });
  });

  test("query: sport + name", async () => {
    await withDb(async (db) => {
      const expected = await addLeague(db, {
        name: "My league 1",
        sport: Sport.Tennis,
      });
      await addLeague(db, { name: "not my league", sport: Sport.Tennis });
      await addLeague(db, { name: "league 1", sport: Sport.Badminton });

      const res = await requestWithAuth(app, auth0Id)
        .post("/league/find")
        .send({ query: { name: "league 1", sport: Sport.Tennis } })
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(200);
      expectAPIRes(res.body).toStrictEqual({
        success: true,
        data: [censorLeague(expected)],
      });
    });
  });

  test("name in lis", async () => {
    await withDb(async (db) => {
      const expected1 = await addLeague(db, {
        name: "My league 1",
        sport: Sport.Tennis,
      });
      const expected2 = await addLeague(db, {
        name: "not my league",
        sport: Sport.Tennis,
      });
      await addLeague(db, { name: "league 1", sport: Sport.Badminton });

      const res = await requestWithAuth(app, auth0Id)
        .post("/league/find")
        .send({
          query: {
            name: { $in: ["My league 1", "not my league"] },
            sport: Sport.Tennis,
          },
        })
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(200);
      expectAPIRes(res.body).toStrictEqual({
        success: true,
        data: [censorLeague(expected1), censorLeague(expected2)],
      });
    });
  });

  test("private league", async () => {
    await withDb(async (db) => {
      const league = await addLeague(db, { private: false });
      await addLeague(db, { private: true });
      await addUser(db);

      const res = await requestWithAuth(app, auth0Id)
        .post("/league/find")
        .send({})
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(200);
      expectAPIRes(res.body).toStrictEqual({
        success: true,
        data: [censorLeague(league)],
      });
    });
  });
});

describe("new", () => {
  test("private", async () => {
    await withDb(async (db) => {
      const auth0Id = "github|123456";
      const currUser = await addUser(db, auth0Id);

      const res = await requestWithAuth(app, auth0Id)
        .post("/league/new")
        .send({ name: "Something", private: true, sport: Sport.Tennis })
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(201);
      expectAPIRes(res.body).toStrictEqual({
        success: true,
        data: {
          _id: expect.any(ObjectId),
          ownerIds: [currUser._id],
          name: "Something",
          sport: Sport.Tennis,
          private: true,
          inviteCode: expect.any(String),
        },
      });
    });
  });
});

describe("invite", () => {
  const auth0Id = "github|123456";
  let user: User;

  beforeEach(async () => {
    user = await withDb((db) => addUser(db, auth0Id));
  });

  test("am owner", async () => {
    await withDb(async (db) => {
      const league = await addLeague(db, {
        ownerIds: [user._id],
        private: true,
        inviteCode: "test",
      });

      const res = await requestWithAuth(app, auth0Id)
        .get(`/league/${league._id.toString()}/invite`)
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        success: true,
        data: "test",
      });
    });
  });

  test("not owner", async () => {
    await withDb(async (db) => {
      const league = await addLeague(db, {
        private: true,
        inviteCode: "test",
      });

      const res = await requestWithAuth(app, auth0Id)
        .get(`/league/${league._id.toString()}/invite`)
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(404);
      expect(res.body).toStrictEqual({
        success: false,
        error: "Failed to get obj",
      });
    });
  });

  test("doesn't exist", async () => {
    const res = await requestWithAuth(app, auth0Id)
      .get(`/league/${IDS[0]}/invite`)
      .set("Authorization", "Bearer test_api_token");

    expect(res.statusCode).toBe(404);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });
  });
});

describe("join", () => {
  const auth0Id = "github|111112";
  let user: User;

  beforeEach(async () => {
    user = await withDb((db) => addUser(db, auth0Id, { leagues: [] }));
  });

  test("public", async () => {
    await withDb(async (db) => {
      const league = await addLeague(db);
      const res = await requestWithAuth(app, auth0Id)
        .post(`/league/${league._id.toString()}/join`)
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({ success: true });

      const u = await (await db.users()).get(user._id);
      expect(u?.leagues).toStrictEqual([league._id]);
    });
  });

  test("not found", async () => {
    await withDb(async (db) => {
      const res = await requestWithAuth(app, auth0Id)
        .post(`/league/${IDS[0]}/join`)
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(404);
      expect(res.body).toStrictEqual({
        success: false,
        error: "Failed to get obj",
      });

      const u = await (await db.users()).get(user._id);
      expect(u?.leagues).toStrictEqual([]);
    });
  });

  test("already in", async () => {
    await withDb(async (db) => {
      await (
        await db.users()
      ).edit(user._id, { $set: { leagues: [new ObjectId(IDS[0])] } });

      const res = await requestWithAuth(app, auth0Id)
        .post(`/league/${IDS[0]}/join`)
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(404);
      expect(res.body).toStrictEqual({
        success: false,
        error: "Failed to get obj",
      });

      const u = await (await db.users()).get(user._id);
      expect(u?.leagues).toStrictEqual([new ObjectId(IDS[0])]);
    });
  });

  describe("private", () => {
    test("have invite code", async () => {
      await withDb(async (db) => {
        const league = await addLeague(db, {
          private: true,
          inviteCode: "test",
        });

        const res = await requestWithAuth(app, auth0Id)
          .post(`/league/${league._id.toString()}/join`)
          .send({ inviteCode: "test" })
          .set("Authorization", "Bearer test_api_token");

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({ success: true });

        const u = await (await db.users()).get(user._id);
        expect(u?.leagues).toStrictEqual([league._id]);
      });
    });

    test("no invite code", async () => {
      await withDb(async (db) => {
        const league = await addLeague(db, {
          private: true,
          inviteCode: "test",
        });

        const res = await requestWithAuth(app, auth0Id)
          .post(`/league/${league._id.toString()}/join`)
          .set("Authorization", "Bearer test_api_token");

        expect(res.statusCode).toBe(404);
        expect(res.body).toStrictEqual({
          success: false,
          error: "Failed to get obj",
        });

        const u = await (await db.users()).get(user._id);
        expect(u?.leagues).toStrictEqual([]);
      });
    });

    test("wrong invite code", async () => {
      await withDb(async (db) => {
        const league = await addLeague(db, {
          private: true,
          inviteCode: "test",
        });

        const res = await requestWithAuth(app, auth0Id)
          .post(`/league/${league._id.toString()}/join`)
          .send({ inviteCode: "nope" })
          .set("Authorization", "Bearer test_api_token");

        expect(res.statusCode).toBe(404);
        expect(res.body).toStrictEqual({
          success: false,
          error: "Failed to get obj",
        });

        const u = await (await db.users()).get(user._id);
        expect(u?.leagues).toStrictEqual([]);
      });
    });
  });
});

describe("edit", () => {
  const auth0Id = "github|111112";
  let user: User;

  beforeEach(async () => {
    user = await withDb((db) => addUser(db, auth0Id, { leagues: [] }));
  });

  test("doesn't exist", async () => {
    const res = await requestWithAuth(app, auth0Id)
      .post(`/league/${IDS[0]}/edit`)
      .send({ name: "HI!" })
      .set("Authorization", "Bearer test_api_token");

    expect(res.statusCode).toBe(404);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });
  });

  test("not owner", async () => {
    await withDb(async (db) => {
      const league = await addLeague(db);

      const res = await requestWithAuth(app, auth0Id)
        .post(`/league/${league._id.toString()}/edit`)
        .send({ name: "HI!" })
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(404);
      expect(res.body).toStrictEqual({
        success: false,
        error: "Failed to get obj",
      });

      const edittedLeague = await (await db.leagues()).get(league._id);
      expect(edittedLeague?.name).not.toBe("HI!");
    });
  });

  test("am owner", async () => {
    await withDb(async (db) => {
      const league = await addLeague(db, { ownerIds: [user._id] });

      const res = await requestWithAuth(app, auth0Id)
        .post(`/league/${league._id.toString()}/edit`)
        .send({ name: "HI!" })
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        success: true,
      });

      const edittedLeague = await (await db.leagues()).get(league._id);
      expect(edittedLeague?.name).toBe("HI!");
    });
  });
});

addCommonTests({
  prefix: "/league",
  creation: {
    name: "Test League",
    sport: Sport.Tennis,
    private: false,
  } as LeagueCreation,
  addObj: (db, _, creation) => addLeague(db, creation),
  addCensoredObj: async (db) =>
    censorLeague(await addLeague(db, { name: generateRandomString() })),
  validateCreation: async (db, currUser) => {
    const coll = await db.leagues();
    const res = await coll.find({});
    expect(res).toStrictEqual([
      {
        _id: expect.any(ObjectId),
        ownerIds: [currUser._id],
        name: "Test League",
        sport: Sport.Tennis,
        private: false,
      },
    ]);
  },
});
