import type { League, LeagueCreation } from "@esp-group-one/types";
import { ObjectId, Sport, censorLeague } from "@esp-group-one/types";
import { expect } from "@jest/globals";
import { generateRandomString } from "ts-randomstring/lib/index.js";
import { IDS, OIDS, addLeague, addUser } from "@esp-group-one/test-helpers";
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
});

describe("new", () => {
  test("private", async () => {
    const res = await user
      .request(app)
      .post("/league/new")
      .send({ name: "Something", private: true, sport: Sport.Tennis });

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
});

describe("picture", () => {
  test("doesn't exist", async () => {
    const res = await user.request(app).get(`/league/${IDS[0]}/picture`).send();

    expect(res.statusCode).toBe(404);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });
  });

  test("private league", async () => {
    const league = await addLeague(db.get(), { private: true });

    const res = await user
      .request(app)
      .get(`/league/${league._id.toString()}/picture`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });
  });

  test("success: no image set", async () => {
    const league = await addLeague(db.get(), { picture: undefined });

    const res = await user
      .request(app)
      .get(`/league/${league._id.toString()}/picture`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual({
      success: true,
      data: null,
    });
  });

  test("success: picture set", async () => {
    const league = await addLeague(db.get(), { picture: "DUMMY!" });

    const res = await user
      .request(app)
      .get(`/league/${league._id.toString()}/picture`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual({
      success: true,
      data: "data:image/webp;base64,DUMMY!",
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
        .send({ ...base, picture: undefined } as L);

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
        private: false,
        round: 0,
      },
    ]);
  },
});
