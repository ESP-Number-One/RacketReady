import type {
  Success,
  User,
  UserCreation,
  UserMatchReturn,
  UserPageOptions,
} from "@esp-group-one/types";
import {
  AbilityLevel,
  ObjectId,
  Sport,
  censorUser,
} from "@esp-group-one/types";
import { describe, expect, test } from "@jest/globals";
import { generateRandomString } from "ts-randomstring/lib/index.js";
import {
  addUser,
  compareBag,
  idCmp,
  IDS,
  OIDS,
  setupAvailability,
} from "@esp-group-one/test-helpers";
import {
  PICTURES,
  getAvailability,
} from "@esp-group-one/types/build/tests/helpers/utils.js";
import moment from "moment";
import { CollectionWrap } from "@esp-group-one/db-client/build/src/collection.js";
import { app } from "../../src/app.js";
import {
  expectAPIRes,
  readStaticFile,
  requestWithAuth,
} from "../helpers/utils.js";
import { addCommonTests, setup } from "../helpers/controller.js";
import { TestUser } from "../helpers/user.js";

const db = setup();

jest.mock("access-token-jwt");

const auth0Id = "github|123456";

describe("me", () => {
  test("success", async () => {
    const user = await addUser(db.get(), auth0Id);
    const res = await requestWithAuth(app, auth0Id).get("/user/me");

    expect(res.statusCode).toBe(200);
    expectAPIRes(res.body).toStrictEqual({
      success: true,
      data: user,
    });
  });

  test("error", async () => {
    const res = await requestWithAuth(app).get("/user/me");

    expect(res.statusCode).toBe(404);
    expectAPIRes(res.body).toStrictEqual({
      success: false,
      error: "Unknown User",
    });
  });
});

describe("new", () => {
  const creation: UserCreation = {
    name: "Test bot",
    description: "bla",
    email: "newtest@bot.com",
    profilePicture: PICTURES[0],
  };

  test("duplicate email", async () => {
    const email = "test@bot.com";
    await addUser(db.get(), auth0Id, { email });
    const res = await requestWithAuth(app, "github|111111")
      .post("/user/new")
      .send({
        ...creation,
        email,
      } as UserCreation);

    expect(res.statusCode).toBe(409);
    expect(res.body).toStrictEqual({
      success: false,
      error: "User already exists",
    });
  });

  test("invalid email", async () => {
    const email =
      "test.....askfhaslkjfhpiwuh ipjbpjsnfdjanflkjb lfksjh fdlaksj";
    await addUser(db.get(), auth0Id, { email });
    const res = await requestWithAuth(app, "github|111111")
      .post("/user/new")
      .send({
        ...creation,
        email,
      } as UserCreation);

    expect(res.statusCode).toBe(400);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Email is invalid",
    });
  });

  test("already mapped user", async () => {
    await addUser(db.get(), auth0Id);
    const res = await requestWithAuth(app, auth0Id)
      .post("/user/new")
      .send(creation);

    expect(res.statusCode).toBe(409);
    expect(res.body).toStrictEqual({
      success: false,
      error: "User already exists",
    });
  });

  testWithProfilePicture("/user/new", creation, 201, (body: Success<User>) =>
    Promise.resolve(body.data.profilePicture),
  );
});

describe("add availability", () => {
  const user = new TestUser(db);

  test("success", async () => {
    await setupAvailability(db.get());

    const availability = getAvailability({ recurring: undefined });
    const res = await user
      .request(app)
      .post("/user/me/availability/add")
      .send(availability);

    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual({
      success: true,
    });

    const caches = await db.get().availabilityCaches();
    const result = await caches.find({ availablePeople: user.id() });

    const day = moment().startOf("hour");
    expect(result).toStrictEqual([
      {
        _id: expect.any(ObjectId),
        start: day.toISOString(),
        availablePeople: [user.id()],
      },
      {
        _id: expect.any(ObjectId),
        start: day.clone().add(1, "hour").toISOString(),
        availablePeople: [user.id()],
      },
    ]);

    const u = await user.update();
    delete availability.recurring;
    expect(u.availability).toStrictEqual([availability]);
  });
});

describe("availability with others", () => {
  const user = new TestUser(db);

  test("success", async () => {
    await setupAvailability(db.get(), [
      [],
      [user.id()],
      [OIDS[0]],
      [user.id(), OIDS[0]],
      [OIDS[0], user.id()],
    ]);

    const res = await user
      .request(app)
      .post(`/user/${IDS[0]}/availability`)
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual({
      success: true,
      data: [
        moment().add(3, "hours").startOf("hours").toISOString(),
        moment().add(4, "hours").startOf("hours").toISOString(),
      ],
    });
  });
});

describe("sports/add", () => {
  const user = new TestUser(db, undefined, { sports: [] });

  test("duplicate sports", async () => {
    const sports = [
      { sport: Sport.Squash, ability: AbilityLevel.Beginner },
      { sport: Sport.Squash, ability: AbilityLevel.Advanced },
    ];

    const res = await user.request(app).post("/user/me/sports/add").send({
      sports,
    });

    expect(res.statusCode).toBe(200);
    const u = await user.update();
    expect(u.sports).toStrictEqual([sports[1]]);
  });

  test("update previous sport", async () => {
    await user.edit({
      $set: {
        sports: [{ sport: Sport.Squash, ability: AbilityLevel.Beginner }],
      },
    });

    const sports = [
      { sport: Sport.Squash, ability: AbilityLevel.Advanced },
      { sport: Sport.Tennis, ability: AbilityLevel.Advanced },
    ];

    const res = await user.request(app).post("/user/me/sports/add").send({
      sports,
    });

    expect(res.statusCode).toBe(200);
    const u = await user.update();
    expect(u.sports).toStrictEqual(sports);
  });

  test("has sports", async () => {
    const origSports = [
      { sport: Sport.Squash, ability: AbilityLevel.Beginner },
    ];

    await user.edit({
      $set: {
        sports: origSports,
      },
    });

    const sports = [
      { sport: Sport.Tennis, ability: AbilityLevel.Beginner },
      { sport: Sport.Badminton, ability: AbilityLevel.Advanced },
    ];

    const res = await user.request(app).post("/user/me/sports/add").send({
      sports,
    });

    expect(res.statusCode).toBe(200);
    const u = await user.update();
    expect(u.sports).toStrictEqual([...origSports, ...sports]);
  });

  test("Success", async () => {
    const sports = [
      { sport: Sport.Squash, ability: AbilityLevel.Advanced },
      { sport: Sport.Tennis, ability: AbilityLevel.Advanced },
    ];

    const res = await user.request(app).post("/user/me/sports/add").send({
      sports,
    });

    expect(res.statusCode).toBe(200);
    const u = await user.update();
    expect(u.sports).toStrictEqual(sports);
  });
});

describe("edit", () => {
  const user = new TestUser(db);

  test("duplicate email", async () => {
    const email = "test@bot.com";
    await addUser(db.get(), "github|111111", { email });
    const res = await user
      .request(app)
      .post("/user/me/edit")
      .send({
        description: "Hi I'm 100% a real person",
        email: "test@bot.com",
        name: "Alex Dasher",
      } as UserCreation);

    expect(res.statusCode).toBe(409);
    expect(res.body).toStrictEqual({
      success: false,
      error: "User already exists",
    });
  });

  test("duplicate email", async () => {
    const email = "test@bot.com";
    await addUser(db.get(), "github|111111", { email });
    const res = await user
      .request(app)
      .post("/user/me/edit")
      .send({
        description: "Hi I'm 100% a real person",
        email: "testkjashl kjhfl kjashfl kjhelk jhaslkjd f",
        name: "Alex Dasher",
      } as UserCreation);

    expect(res.statusCode).toBe(400);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Email is invalid",
    });
  });

  test("Success", async () => {
    const update: Partial<UserCreation> = {
      description: "Hi I'm 100% a real person",
      email: "alex@demdashers.com",
      name: "Alex Dasher",
    };

    const res = await user.request(app).post("/user/me/edit").send(update);

    expect(res.status).toBe(200);

    const u = await user.update();
    expect(u.description).toBe(update.description);
    expect(u.email).toBe(update.email);
    expect(u.name).toBe(update.name);
  });

  testWithProfilePicture(
    "/user/me/edit",
    {},
    200,
    async () => {
      const u = await user.update();
      return u.profilePicture;
    },
    user,
  );
});

describe("find", () => {
  const user = new TestUser(db, auth0Id);

  test("with query", async () => {
    const names = ["Test bot 1", "Test Bot 2", "Test bot 3"];
    const promises = [];
    for (const n of names) {
      promises.push(addUser(db.get(), generateRandomString(), { name: n }));
    }

    const users = await Promise.all(promises);

    const res = await user
      .request(app)
      .post("/user/find")
      .send({ query: { profileText: "bot 1$" } } as UserPageOptions);

    expect(res.status).toBe(200);
    expectAPIRes(res.body).toEqual({
      success: true,
      data: [censorUser(users[0])],
    });
  });

  test("with sports", async () => {
    await db.reset();
    await user.setup();

    const sports = [Sport.Tennis, Sport.Squash, Sport.Badminton];
    const promises = [];
    for (const s of sports) {
      promises.push(
        addUser(db.get(), generateRandomString(), {
          sports: [{ sport: s, ability: AbilityLevel.Beginner }],
        }),
      );
    }

    const users = await Promise.all(promises);

    const res = await user
      .request(app)
      .post("/user/find")
      .send({ query: { sports: Sport.Tennis } } as UserPageOptions);

    expect(res.status).toBe(200);
    expectAPIRes(res.body).toEqual({
      success: true,
      data: [censorUser(users[0])],
    });
  });

  test("with multi", async () => {
    const names = [
      {
        name: "Test bot 1",
        sport: [{ sport: Sport.Tennis, ability: AbilityLevel.Beginner }],
      },
      {
        name: "Test Bot 1",
        sports: [{ sport: Sport.Squash, ability: AbilityLevel.Beginner }],
      },
      {
        name: "Test bot 2",
        sports: [{ sport: Sport.Tennis, ability: AbilityLevel.Beginner }],
      },
    ];
    const promises = [];
    for (const n of names) {
      promises.push(addUser(db.get(), generateRandomString(), n));
    }

    const users = await Promise.all(promises);

    const res = await user
      .request(app)
      .post("/user/find")
      .send({
        query: { profileText: "bot 1$", sports: Sport.Tennis },
      } as UserPageOptions);

    expect(res.status).toBe(200);
    expectAPIRes(res.body).toEqual({
      success: true,
      data: [censorUser(users[0])],
    });
  });

  test("with crash", async () => {
    const spy = jest
      .spyOn(CollectionWrap.prototype, "page")
      .mockImplementation(() => {
        return Promise.reject(new Error("Panic"));
      });

    const res = await user
      .request(app)
      .post("/user/find")
      .send({
        query: { profileText: "bot 1$", sports: Sport.Tennis },
      } as UserPageOptions);

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

describe("Recommendations", () => {
  const user = new TestUser(db, undefined, {
    sports: [
      { sport: Sport.Tennis, ability: AbilityLevel.Beginner },
      { sport: Sport.Badminton, ability: AbilityLevel.Advanced },
    ],
  });

  test("No matches", async () => {
    await setupAvailability(db.get(), [[user.id()]]);

    const res = await user.request(app).post("/user/recommendations");

    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual({ data: [], success: true });
  });

  test("Has matches", async () => {
    const data = [
      await addUser(db.get(), undefined, {
        sports: [{ sport: Sport.Tennis, ability: AbilityLevel.Beginner }],
      }),
      await addUser(db.get(), undefined, {
        sports: [
          { sport: Sport.Tennis, ability: AbilityLevel.Beginner },
          { sport: Sport.Badminton, ability: AbilityLevel.Advanced },
        ],
      }),
      await addUser(db.get(), undefined, {
        sports: [{ sport: Sport.Tennis, ability: AbilityLevel.Advanced }],
      }),
      await addUser(db.get(), undefined, {
        sports: [{ sport: Sport.Squash, ability: AbilityLevel.Beginner }],
      }),
      await addUser(db.get(), undefined, {
        sports: [{ sport: Sport.Tennis, ability: AbilityLevel.Beginner }],
      }),
    ];

    await setupAvailability(db.get(), [
      [user.id(), ...data.slice(0, -1).map((u) => u._id)],
      [data[4]._id],
    ]);

    const res = await user.request(app).post("/user/recommendations");

    expect(res.statusCode).toBe(200);
    const body = ObjectId.fromObj(res.body) as Success<UserMatchReturn>;
    expect(body.success).toBe(true);
    compareBag(
      body.data,
      [
        { u: censorUser(data[0]), sport: Sport.Tennis },
        { u: censorUser(data[1]), sport: Sport.Tennis },
        { u: censorUser(data[1]), sport: Sport.Badminton },
      ],
      (a, b) =>
        a.u._id.equals(b.u._id)
          ? a.sport.localeCompare(b.sport)
          : idCmp(a.u, b.u),
    );
  });
});

addCommonTests({
  prefix: "/user",
  getCreation: () => {
    return {
      name: "New Test Bot",
      description: "bla bla bla",
      profilePicture: PICTURES[0],
      email: "new@test.com",
    } as UserCreation;
  },
  dontAddUserOnCreation: true,
  addObj: (_, creation) => addUser(db.get(), generateRandomString(), creation),
  addCensoredObj: async () => {
    const user = await addUser(db.get(), generateRandomString(), {
      name: generateRandomString(),
      email: `${generateRandomString({ length: 10 })}@test.com`,
    });
    return censorUser(user);
  },
  validateCreation: async () => {
    const coll = await db.get().users();
    const res = await coll.find({});
    expect(res).toStrictEqual([
      {
        _id: expect.any(ObjectId),
        name: "New Test Bot",
        description: "bla bla bla",
        profilePicture: expect.any(String),
        email: "new@test.com",
        rating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        sports: [],
        leagues: [],
        availability: [],
      },
    ]);
  },
});

function testWithProfilePicture<T, R>(
  endpoint: string,
  base: T,
  successCode: number,
  getProfilePicture: (body: R) => Promise<string>,
  user?: TestUser,
) {
  describe("With profile picture", () => {
    ["png", "jpeg", "webp"].forEach((filetype) => {
      const profilePicture = readStaticFile(`profile.${filetype}`);

      // The results have been manually vailidated due to the small differences
      const resProfilePicture = readStaticFile(`res-${filetype}.webp`);

      test(filetype, async () => {
        const res = await requestWithAuth(app, user?.auth0Id)
          .post(endpoint)
          .send({ ...base, profilePicture });

        expect(res.status).toBe(successCode);
        await expect(getProfilePicture(res.body as R)).resolves.toBe(
          resProfilePicture,
        );
      });
    });

    test("Invalid base64", async () => {
      const res = await requestWithAuth(app, user?.auth0Id)
        .post(endpoint)
        .send({ ...base, profilePicture: "as;lkdfj'z=['/-ф" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual({
        success: false,
        error: "Unknown image format",
      });
    });

    test("Invalid image", async () => {
      const profilePicture = readStaticFile("not_an_image.txt");

      const res = await requestWithAuth(app, user?.auth0Id)
        .post(endpoint)
        .send({ ...base, profilePicture });

      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual({
        success: false,
        error: "Unknown image format",
      });
    });
  });
}
