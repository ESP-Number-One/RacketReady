import * as fs from "node:fs";
import type {
  Success,
  User,
  UserCreation,
  UserPageOptions,
} from "@esp-group-one/types";
import { ObjectId, censorUser } from "@esp-group-one/types";
import { describe, expect, test } from "@jest/globals";
import { generateRandomString } from "ts-randomstring/lib/index.js";
import {
  addUser,
  IDS,
  OIDS,
  setupAvailability,
} from "@esp-group-one/test-helpers";
import { getAvailability } from "@esp-group-one/types/build/tests/helpers/utils.js";
import moment from "moment";
import { app } from "../../src/app.js";
import { expectAPIRes, requestWithAuth } from "../helpers/utils.js";
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
    profilePicture: "",
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
  test("with query", async () => {
    await addUser(db.get(), auth0Id);

    const names = ["Test bot 1", "Test Bot 2", "Test bot 3"];
    const promises = [];
    for (const n of names) {
      promises.push(addUser(db.get(), generateRandomString(), { name: n }));
    }

    const users = await Promise.all(promises);

    const res = await requestWithAuth(app, auth0Id)
      .post("/user/find")
      .send({ query: { profileText: "bot 1$" } } as UserPageOptions);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: [censorUser(users[0])],
    });
  });
});

addCommonTests({
  prefix: "/user",
  getCreation: () => {
    return {
      name: "New Test Bot",
      description: "bla bla bla",
      profilePicture: "",
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
        profilePicture: "",
        email: "new@test.com",
        rating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        sports: [],
        leagues: [],
        availability: [],
      },
    ]);
  },
});

function readStaticFile(filename: string): string {
  let file = `tests/static/${filename}`;
  if (!fs.existsSync(file)) {
    file = `packages/backend/${file}`;
  }

  const bitmap = fs.readFileSync(file);
  return Buffer.from(bitmap).toString("base64");
}

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
