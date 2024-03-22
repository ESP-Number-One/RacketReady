import type {
  League,
  LeagueCreation,
  Match,
  Scores,
  User,
} from "@esp-group-one/types";
import {
  MatchStatus,
  AbilityLevel,
  ObjectId,
  Sport,
  censorLeague,
} from "@esp-group-one/types";
import { expect } from "@jest/globals";
import { generateRandomString } from "ts-randomstring/lib/index.js";
import {
  IDS,
  OIDS,
  addLeague,
  addMatch,
  addUser,
  setupAvailability,
  stopTime,
} from "@esp-group-one/test-helpers";
import moment from "moment";
import { CollectionWrap } from "@esp-group-one/db-client/build/src/collection.js";
import type { FilterOptions } from "@esp-group-one/db-client";
import { addCommonTests, setup } from "../helpers/controller.js";
import { expectAPIRes, readStaticFile } from "../helpers/utils.js";
import { app } from "../../src/app.js";
import { TestUser } from "../helpers/user.js";

const db = setup();
const user = new TestUser(db, "github|111112");

jest.mock("access-token-jwt");

describe("get", () => {
  test("private league", async () => {
    const league = await addLeague(db.get(), { private: true });

    const res = await user.request(app).get(`/league/${league._id.toString()}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });
  });
});

describe("find", () => {
  test("am in", async () => {
    const expected = await addLeague(db.get(), { name: "My league" });
    await addLeague(db.get(), { name: "not my league" });
    await user.edit({ $set: { leagues: [expected._id] } });

    const res = await user
      .request(app)
      .post("/league/find")
      .send({ query: { amIn: true } });

    expect(res.statusCode).toBe(200);
    expectAPIRes(res.body).toStrictEqual({
      success: true,
      data: [censorLeague(expected)],
    });
  });

  test("am not in", async () => {
    const notExpected = await addLeague(db.get(), { name: "My league" });
    const expected = await addLeague(db.get(), { name: "not my league" });
    await user.edit({ $set: { leagues: [notExpected._id] } });

    const res = await user
      .request(app)
      .post("/league/find")
      .send({ query: { amIn: false } });

    expect(res.statusCode).toBe(200);
    expectAPIRes(res.body).toStrictEqual({
      success: true,
      data: [censorLeague(expected)],
    });
  });

  test("query: sport + name", async () => {
    const expected = await addLeague(db.get(), {
      name: "My league 1",
      sport: Sport.Tennis,
    });
    await addLeague(db.get(), { name: "not my league", sport: Sport.Tennis });
    await addLeague(db.get(), { name: "league 1", sport: Sport.Badminton });

    const res = await user
      .request(app)
      .post("/league/find")
      .send({ query: { name: "league 1", sport: Sport.Tennis } });

    expect(res.statusCode).toBe(200);
    expectAPIRes(res.body).toStrictEqual({
      success: true,
      data: [censorLeague(expected)],
    });
  });

  test("name in lis", async () => {
    const expected1 = await addLeague(db.get(), {
      name: "My league 1",
      sport: Sport.Tennis,
    });
    const expected2 = await addLeague(db.get(), {
      name: "not my league",
      sport: Sport.Tennis,
    });
    await addLeague(db.get(), { name: "league 1", sport: Sport.Badminton });

    const res = await user
      .request(app)
      .post("/league/find")
      .send({
        query: {
          name: { $in: ["My league 1", "not my league"] },
          sport: Sport.Tennis,
        },
      });

    expect(res.statusCode).toBe(200);
    expectAPIRes(res.body).toStrictEqual({
      success: true,
      data: [censorLeague(expected1), censorLeague(expected2)],
    });
  });

  test("private league", async () => {
    const league = await addLeague(db.get(), { private: false });
    await addLeague(db.get(), { private: true });
    await addUser(db.get());

    const res = await user.request(app).post("/league/find").send({});

    expect(res.statusCode).toBe(200);
    expectAPIRes(res.body).toStrictEqual({
      success: true,
      data: [censorLeague(league)],
    });
  });

  test("with crash", async () => {
    const usersColl = await db.get().users();
    const original = usersColl.page.bind(usersColl);
    const spy = jest.spyOn(CollectionWrap.prototype, "page");

    // This is written as if it was a user as we have to allow that to pass
    // but technically this will also be run with type League
    spy.mockImplementation(function page(
      this: CollectionWrap<User>,
      opts: FilterOptions<User>,
    ) {
      if (opts.pageSize === 57) return Promise.reject(new Error("Panic"));
      return original(opts);
    });

    const res = await user
      .request(app)
      .post("/league/find")
      .send({ pageSize: 57 });

    // Restore the mock before we start checking (as it will break other tests)
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();

    expect(res.status).toBe(500);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });
  });
});

describe("rounds", () => {
  test("public league", async () => {
    const league = await addLeague(db.get(), {});

    await addMatch(db.get(), { league: league._id, round: 1 });
    await addMatch(db.get(), { league: league._id, round: 1 });
    await addMatch(db.get(), { league: league._id, round: 2 });

    const res = await user
      .request(app)
      .get(`/league/${league._id.toString()}/rounds`);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({ success: true, data: { rounds: [1, 2] } });
  });

  describe("private league", () => {
    test("part of the league", async () => {
      const league = await addLeague(db.get(), { private: true });
      await user.edit({ $set: { leagues: [league._id] } });

      await addMatch(db.get(), { league: league._id, round: 1 });
      await addMatch(db.get(), { league: league._id, round: 1 });
      await addMatch(db.get(), { league: league._id, round: 2 });

      const res = await user
        .request(app)
        .get(`/league/${league._id.toString()}/rounds`);

      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual({
        success: true,
        data: { rounds: [1, 2] },
      });
    });

    test("not part of the league", async () => {
      const league = await addLeague(db.get(), { private: true });

      const res = await user
        .request(app)
        .get(`/league/${league._id.toString()}/rounds`);

      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({
        success: false,
        error: "Failed to get obj",
      });
    });
  });

  test("doesn't exist", async () => {
    const res = await user.request(app).get(`/league/${IDS[0]}/rounds`);

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });
  });
});

describe("new", () => {
  test("private", async () => {
    const res = await user.request(app).post("/league/new").send({
      name: "Something",
      private: true,
      sport: Sport.Tennis,
      picture: null,
    });

    expect(res.statusCode).toBe(201);
    expectAPIRes(res.body).toStrictEqual({
      success: true,
      data: {
        _id: expect.any(ObjectId),
        ownerIds: [user.id()],
        name: "Something",
        sport: Sport.Tennis,
        round: 0,
        private: true,
        inviteCode: expect.any(String),
        picture: null,
      },
    });
  });

  testWithPicture<LeagueCreation>(
    () =>
      Promise.resolve({
        path: `/league/new`,
      }),
    {
      name: "Shiny new league!",
      sport: Sport.Tennis,
      private: true,
    },
    { successCode: 201 },
  );
});

describe("invite", () => {
  test("am owner", async () => {
    const league = await addLeague(db.get(), {
      ownerIds: [user.id()],
      private: true,
      inviteCode: "test",
    });

    const res = await user
      .request(app)
      .get(`/league/${league._id.toString()}/invite`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual({
      success: true,
      data: "test",
    });
  });

  test("not owner", async () => {
    const league = await addLeague(db.get(), {
      private: true,
      inviteCode: "test",
    });

    const res = await user
      .request(app)
      .get(`/league/${league._id.toString()}/invite`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });
  });

  test("doesn't exist", async () => {
    const res = await user.request(app).get(`/league/${IDS[0]}/invite`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });
  });
});

describe("join", () => {
  beforeEach(async () => {
    await user.edit({ $set: { leagues: [] } });
  });

  test("public", async () => {
    const league = await addLeague(db.get());
    const res = await user
      .request(app)
      .post(`/league/${league._id.toString()}/join`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual({ success: true });

    const u = await user.update();
    expect(u.leagues).toStrictEqual([league._id]);
  });

  test("started", async () => {
    const league = await addLeague(db.get(), { round: 1 });
    const res = await user
      .request(app)
      .post(`/league/${league._id.toString()}/join`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });

    const u = await user.update();
    expect(u.leagues).toStrictEqual([]);
  });

  test("not found", async () => {
    const res = await user.request(app).post(`/league/${IDS[0]}/join`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });

    const u = await user.update();
    expect(u.leagues).toStrictEqual([]);
  });

  test("already in", async () => {
    await user.edit({ $set: { leagues: [OIDS[0]] } });

    const res = await user.request(app).post(`/league/${IDS[0]}/join`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });

    const u = await user.update();
    expect(u.leagues).toStrictEqual([OIDS[0]]);
  });

  describe("private", () => {
    test("have invite code", async () => {
      const league = await addLeague(db.get(), {
        private: true,
        inviteCode: "test",
      });

      const res = await user
        .request(app)
        .post(`/league/${league._id.toString()}/join`)
        .send({ inviteCode: "test" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({ success: true });

      const u = await user.update();
      expect(u.leagues).toStrictEqual([league._id]);
    });

    test("no invite code", async () => {
      const league = await addLeague(db.get(), {
        private: true,
        inviteCode: "test",
      });

      const res = await user
        .request(app)
        .post(`/league/${league._id.toString()}/join`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toStrictEqual({
        success: false,
        error: "Failed to get obj",
      });

      const u = await user.update();
      expect(u.leagues).toStrictEqual([]);
    });

    test("wrong invite code", async () => {
      const league = await addLeague(db.get(), {
        private: true,
        inviteCode: "test",
      });

      const res = await user
        .request(app)
        .post(`/league/${league._id.toString()}/join`)
        .send({ inviteCode: "nope" });

      expect(res.statusCode).toBe(404);
      expect(res.body).toStrictEqual({
        success: false,
        error: "Failed to get obj",
      });

      const u = await user.update();
      expect(u.leagues).toStrictEqual([]);
    });
  });
});

describe("edit", () => {
  test("doesn't exist", async () => {
    const res = await user
      .request(app)
      .post(`/league/${IDS[0]}/edit`)
      .send({ name: "HI!" });

    expect(res.statusCode).toBe(404);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });
  });

  test("not owner", async () => {
    const league = await addLeague(db.get());

    const res = await user
      .request(app)
      .post(`/league/${league._id.toString()}/edit`)
      .send({ name: "HI!" });

    expect(res.statusCode).toBe(404);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });

    const edittedLeague = await (await db.get().leagues()).get(league._id);
    expect(edittedLeague?.name).not.toBe("HI!");
  });

  test("am owner", async () => {
    const league = await addLeague(db.get(), { ownerIds: [user.id()] });

    const res = await user
      .request(app)
      .post(`/league/${league._id.toString()}/edit`)
      .send({ name: "HI!" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual({
      success: true,
    });

    const edittedLeague = await (await db.get().leagues()).get(league._id);
    expect(edittedLeague?.name).toBe("HI!");
  });

  testWithPicture<League>(
    async () => {
      const league = await addLeague(db.get(), { ownerIds: [user.id()] });
      return {
        path: `/league/${league._id.toString()}/edit`,
        refresh: async () =>
          (await db.get().leagues()).get(league._id) as Promise<League>,
      };
    },
    { name: "Changed!" },
    { successCode: 200 },
  );

  test("with crash", async () => {
    const spy = jest
      .spyOn(CollectionWrap.prototype, "edit")
      .mockImplementation(() => {
        return Promise.reject(new Error("Panic"));
      });

    const league = await addLeague(db.get(), { ownerIds: [user.id()] });

    const res = await user
      .request(app)
      .post(`/league/${league._id.toString()}/edit`)
      .send({ name: "HI!" });

    // Restore the mock before we start checking (as it will break other tests)
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();

    expect(res.status).toBe(500);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Could not update league",
    });
  });
});

describe("next round", () => {
  const getUsers = async (league: ObjectId, sport: Sport) => {
    const users = [
      await addUser(db.get(), undefined, {
        leagues: [league],
        sports: [{ sport, ability: AbilityLevel.Beginner }],
      }),
      await addUser(db.get(), undefined, {
        leagues: [league],
        sports: [{ sport, ability: AbilityLevel.Beginner }],
      }),
      await addUser(db.get(), undefined, {
        leagues: [league],
        sports: [{ sport, ability: AbilityLevel.Advanced }],
      }),
      await addUser(db.get(), undefined, {
        leagues: [league],
        sports: [{ sport, ability: AbilityLevel.Advanced }],
      }),
    ];

    await setupAvailability(
      db.get(),
      [
        [users[0]._id, users[1]._id],
        [users[0]._id, users[1]._id],
      ],
      moment().add(2, "day"),
    );
    return users;
  };

  const assignMatches = async (
    league: ObjectId,
    round: number,
    users: User[],
    status: MatchStatus = MatchStatus.Complete,
  ) => {
    const matches: Promise<Match>[] = [];
    for (let i = 0; i < users.length; i += 2) {
      const a = users[i];
      const b = users[i + 1];

      let score: Scores | undefined;
      if (status === MatchStatus.Complete) {
        score = {};
        score[a._id.toString()] = 10 + (i % 4 === 0 ? 10 : 0);
        score[b._id.toString()] = 15;
      }

      matches.push(
        addMatch(db.get(), {
          status,
          round,
          league,
          players: [a._id, b._id],
          score,
        }),
      );
    }
    return Promise.all(matches);
  };

  stopTime();

  test("first round", async () => {
    const sport = Sport.Tennis;
    const round = 1;
    const league = await addLeague(db.get(), {
      ownerIds: [user.id()],
      round: round - 1,
      sport,
    });

    const users = await getUsers(league._id, sport);

    const res = await user
      .request(app)
      .post(`/league/${league._id.toString()}/round/next`)
      .send({ force: false });

    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual({
      success: true,
    });

    const matchesColl = await db.get().matches();
    const matches = await matchesColl.find({});
    expect(matches).toStrictEqual([
      {
        _id: expect.any(ObjectId) as unknown as ObjectId,
        status: MatchStatus.Request,
        league: league._id,
        owner: league._id,
        players: [users[0]._id, users[1]._id],
        date: moment()
          .startOf("hour")
          .add(2, "hours")
          .add(2, "days")
          .toISOString(),
        messages: [],
        sport,
        round,
      },
      {
        _id: expect.any(ObjectId) as unknown as ObjectId,
        status: MatchStatus.Request,
        league: league._id,
        owner: league._id,
        players: [users[2]._id, users[3]._id],
        date: expect.any(String) as unknown as string,
        messages: [],
        sport,
        round,
      },
    ] as Match[]);
  });

  test("second round", async () => {
    const sport = Sport.Tennis;
    const round = 2;
    const league = await addLeague(db.get(), {
      ownerIds: [user.id()],
      round: round - 1,
      sport,
    });

    const users = await getUsers(league._id, sport);
    const matches = await assignMatches(league._id, round - 1, users);

    const res = await user
      .request(app)
      .post(`/league/${league._id.toString()}/round/next`)
      .send({ force: false });

    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual({
      success: true,
    });

    const matchesColl = await db.get().matches();
    const allMatches = await matchesColl.find({});
    expect(allMatches.slice(matches.length)).toStrictEqual([
      {
        _id: expect.any(ObjectId) as unknown as ObjectId,
        status: MatchStatus.Request,
        league: league._id,
        owner: league._id,
        players: [users[0]._id, users[3]._id],
        date: expect.any(String) as unknown as string,
        messages: [],
        sport,
        round,
      },
    ] as Match[]);
  });

  test("odd number of users", async () => {
    const sport = Sport.Tennis;
    const round = 2;
    const league = await addLeague(db.get(), {
      ownerIds: [user.id()],
      round: round - 1,
      sport,
    });

    const users = await getUsers(league._id, sport);
    users.push(...(await getUsers(league._id, sport)));
    // Only 3 people can be assigned a match
    const matches = await assignMatches(
      league._id,
      round - 1,
      users.slice(0, 6),
    );

    const res = await user
      .request(app)
      .post(`/league/${league._id.toString()}/round/next`)
      .send({ force: false });

    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual({
      success: true,
    });

    const matchesColl = await db.get().matches();
    const allMatches = await matchesColl.find({});
    expect(allMatches.slice(matches.length)).toStrictEqual([
      {
        _id: expect.any(ObjectId) as unknown as ObjectId,
        status: MatchStatus.Request,
        league: league._id,
        owner: league._id,
        players: [users[0]._id, users[4]._id],
        date: expect.any(String) as unknown as string,
        messages: [],
        sport,
        round,
      },
      {
        _id: expect.any(ObjectId) as unknown as ObjectId,
        status: MatchStatus.Complete,
        score: Object.fromEntries([[users[3]._id.toString(), 1]]),
        usersRated: [users[3]._id],
        league: league._id,
        owner: league._id,
        players: [users[3]._id],
        date: expect.any(String) as unknown as string,
        messages: [],
        sport,
        round,
      },
    ] as Match[]);
  });

  describe("force required", () => {
    test("no force", async () => {
      const sport = Sport.Tennis;
      const round = 2;
      const league = await addLeague(db.get(), {
        ownerIds: [user.id()],
        round: round - 1,
        sport,
      });

      const users = await getUsers(league._id, sport);
      await assignMatches(league._id, round - 1, users, MatchStatus.Accepted);

      const res = await user
        .request(app)
        .post(`/league/${league._id.toString()}/round/next`)
        .send({ force: false });

      expect(res.statusCode).toBe(409);
      expect(res.body).toStrictEqual({
        success: false,
        error: "All matches must be complete to go to the next round",
      });
    });

    test("with force", async () => {
      const sport = Sport.Tennis;
      const round = 2;
      const league = await addLeague(db.get(), {
        ownerIds: [user.id()],
        round: round - 1,
        sport,
      });

      const notFinishedUsers = await getUsers(league._id, sport);
      const finishedUsers = await getUsers(league._id, sport);
      const matches = await assignMatches(
        league._id,
        round - 1,
        notFinishedUsers,
        MatchStatus.Accepted,
      );

      matches.push(
        ...(await assignMatches(
          league._id,
          round - 1,
          finishedUsers,
          MatchStatus.Complete,
        )),
      );

      const res = await user
        .request(app)
        .post(`/league/${league._id.toString()}/round/next`)
        .send({ force: true });

      expect(res.statusCode).toBe(200);
      expect(res.body).toStrictEqual({
        success: true,
      });

      const matchesColl = await db.get().matches();
      const allMatches = await matchesColl.find({});
      expect(allMatches.slice(matches.length)).toStrictEqual([
        {
          _id: expect.any(ObjectId) as unknown as ObjectId,
          status: MatchStatus.Request,
          league: league._id,
          owner: league._id,
          players: [finishedUsers[0]._id, finishedUsers[3]._id],
          date: expect.any(String) as unknown as string,
          messages: [],
          sport,
          round,
        },
      ] as Match[]);
    });
  });

  test("not owner", async () => {
    const league = await addLeague(db.get(), {});

    const res = await user
      .request(app)
      .post(`/league/${league._id.toString()}/round/next`)
      .send({ force: false });

    expect(res.statusCode).toBe(404);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });
  });

  test("doesn't exist", async () => {
    const res = await user
      .request(app)
      .post(`/league/${IDS[0]}/round/next`)
      .send({ force: false });

    expect(res.statusCode).toBe(404);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });
  });

  test("no users", async () => {
    const league = await addLeague(db.get(), {
      ownerIds: [user.id()],
    });

    const res = await user
      .request(app)
      .post(`/league/${league._id.toString()}/round/next`)
      .send({ force: false });

    expect(res.statusCode).toBe(409);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Not enough users are able to play in the next round",
    });
  });
});

function testWithPicture<L extends object>(
  endpoint: () => Promise<{ path: string; refresh?: () => Promise<League> }>,
  base: Partial<L>,
  { successCode }: { successCode: number },
) {
  describe("withPicture", () => {
    // Test valid image conversions to `.webp`
    ["png", "jpeg", "webp"]
      .map((filetype) => ({
        filetype,
        picture: readStaticFile(`profile.${filetype}`),
        // The results have been manually vailidated due to the small differences
        converted: readStaticFile(`res-${filetype}.webp`),
      }))
      .forEach(({ filetype, picture, converted }) => {
        test(filetype, async () => {
          const { path, refresh } = await endpoint();
          const res = await user
            .request(app)
            .post(path)
            .send({ ...base, picture } as L);

          expect(res.status).toBe(successCode);

          const updatedPicture =
            refresh !== undefined
              ? (await refresh()).picture
              : (res.body as { data: { picture: string } | undefined }).data
                  ?.picture;

          expect(updatedPicture).toBe(converted);
        });
      });

    test("Invalid base64", async () => {
      const { path } = await endpoint();
      const res = await user
        .request(app)
        .post(path)
        .send({ ...base, picture: "as;lkdfj'z=['/-ф" } as L);

      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual({
        success: false,
        error: "Unknown image format",
      });
    });

    test("Invalid image", async () => {
      const { path } = await endpoint();
      const picture = readStaticFile("not_an_image.txt");

      const res = await user
        .request(app)
        .post(path)
        .send({ ...base, picture } as L);

      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual({
        success: false,
        error: "Unknown image format",
      });
    });

    test("No image", async () => {
      const { path } = await endpoint();
      const res = await user
        .request(app)
        .post(path)
        .send({ ...base, picture: null } as L);

      expect(res.statusCode).toBe(successCode);
    });
  });
}

addCommonTests({
  prefix: "/league",
  getCreation: () => {
    return {
      name: "Test League",
      sport: Sport.Tennis,
      private: false,
      picture: null,
    } as LeagueCreation;
  },
  addObj: (_, creation) => addLeague(db.get(), creation),
  addCensoredObj: async () =>
    censorLeague(await addLeague(db.get(), { name: generateRandomString() })),
  validateCreation: async (currUser) => {
    const coll = await db.get().leagues();
    const res = await coll.find({});
    expect(res).toStrictEqual([
      {
        _id: expect.any(ObjectId),
        ownerIds: [currUser._id],
        name: "Test League",
        sport: Sport.Tennis,
        picture: null,
        private: false,
        round: 0,
      },
    ]);
  },
});
