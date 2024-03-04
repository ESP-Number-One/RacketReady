import * as fs from "node:fs";
import type {
  PageOptions,
  Success,
  User,
  UserCreation,
  UserQuery,
} from "@esp-group-one/types";
import { ObjectId, censorUser, tests } from "@esp-group-one/types";
import { describe, expect, test } from "@jest/globals";
import { generateRandomString } from "ts-randomstring/lib/index.js";
import { app } from "../../src/app.js";
import { addUser, expectAPIRes, requestWithAuth } from "../helpers/utils.js";
import { addCommonTests, setup, withDb } from "../helpers/controller.js";

const { IDS } = tests;

setup();

jest.mock("access-token-jwt");

const auth0Id = "github|123456";

describe("me", () => {
  test("success", async () => {
    await withDb(async (db) => {
      const user = await addUser(db, auth0Id);
      const res = await requestWithAuth(app, auth0Id)
        .get("/user/me")
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(200);
      expectAPIRes(res.body).toStrictEqual({
        success: true,
        data: user,
      });
    });
  });

  test("error", async () => {
    const res = await requestWithAuth(app)
      .get("/user/me")
      .set("Authorization", "Bearer test_api_token");

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
    await withDb(async (db) => {
      const email = "test@bot.com";
      await addUser(db, auth0Id, { email });
      const res = await requestWithAuth(app, "github|111111")
        .post("/user/new")
        .send({
          ...creation,
          email,
        } as UserCreation)
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(409);
      expect(res.body).toStrictEqual({
        success: false,
        error: "User already exists",
      });
    });
  });

  test("already mapped user", async () => {
    await withDb(async (db) => {
      await addUser(db, auth0Id);
      const res = await requestWithAuth(app, auth0Id)
        .post("/user/new")
        .send(creation)
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(409);
      expect(res.body).toStrictEqual({
        success: false,
        error: "User already exists",
      });
    });
  });

  testWithProfilePicture("/user/new", creation, 201, (body: Success<User>) =>
    Promise.resolve(body.data.profilePicture),
  );
});

describe("edit", () => {
  let user: User;

  beforeEach(async () => {
    await withDb(async (db) => {
      user = await addUser(db);
    });
  });

  test("duplicate email", async () => {
    await withDb(async (db) => {
      const email = "test@bot.com";
      await addUser(db, "github|111111", { email });
      const res = await requestWithAuth(app)
        .post("/user/me/edit")
        .send({
          description: "Hi I'm 100% a real person",
          email: "test@bot.com",
          name: "Alex Dasher",
        } as UserCreation)
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(409);
      expect(res.body).toStrictEqual({
        success: false,
        error: "User already exists",
      });
    });
  });

  test("Success", async () => {
    const update: Partial<UserCreation> = {
      description: "Hi I'm 100% a real person",
      email: "alex@demdashers.com",
      name: "Alex Dasher",
    };

    const res = await requestWithAuth(app)
      .post("/user/me/edit")
      .send(update)
      .set("Authorization", "Bearer test_api_token");

    expect(res.status).toBe(200);
    await withDb(async (db) => {
      const u = await (await db.users()).get(user._id);
      expect(u?.description).toBe(update.description);
      expect(u?.email).toBe(update.email);
      expect(u?.name).toBe(update.name);
    });
  });

  testWithProfilePicture("/user/me/edit", {}, 200, () =>
    withDb(async (db) => {
      const u = await (await db.users()).get(user._id);
      return u?.profilePicture ?? "";
    }),
  );
});

describe("profile_picture", () => {
  const profilePicture = readStaticFile("res-webp.webp");
  test("get", async () => {
    await withDb(async (db) => {
      const u = await addUser(db, auth0Id, { profilePicture });
      const res = await requestWithAuth(app, "github|111111")
        .get(`/user/${u._id.toString()}/profile_picture`)
        .set("Authorization", "Bearer test_api_token");

      expect(res.status).toBe(200);
      const body = res.body as Success<string>;
      expect(body.data).toBe(`data:image/webp;base64,${profilePicture}`);
    });
  });

  test("no user", async () => {
    const res = await requestWithAuth(app, "github|111111")
      .get(`/user/${IDS[0]}/profile_picture`)
      .set("Authorization", "Bearer test_api_token");

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });
  });
});

describe("find", () => {
  test("with query", async () => {
    await withDb(async (db) => {
      await addUser(db, auth0Id);

      const names = ["Test bot 1", "Test Bot 2", "Test bot 3"];
      const promises = [];
      for (const n of names) {
        promises.push(addUser(db, generateRandomString(), { name: n }));
      }

      const users = await Promise.all(promises);

      const res = await requestWithAuth(app, auth0Id)
        .post("/user/find")
        .send({ query: { profileText: "bot 1$" } } as PageOptions<UserQuery>)
        .set("Authorization", "Bearer test_api_token");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: [censorUser(users[0])],
      });
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
  addObj: (db, _, creation) => addUser(db, generateRandomString(), creation),
  addCensoredObj: async (db) => {
    const user = await addUser(db, generateRandomString(), {
      name: generateRandomString(),
      email: `${generateRandomString({ length: 10 })}@test.com`,
    });
    return censorUser(user);
  },
  validateCreation: async (db) => {
    const coll = await db.users();
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
) {
  describe("With profile picture", () => {
    ["png", "jpeg", "webp"].forEach((filetype) => {
      const profilePicture = readStaticFile(`profile.${filetype}`);

      // The results have been manually vailidated due to the small differences
      const resProfilePicture = readStaticFile(`res-${filetype}.webp`);

      test(filetype, async () => {
        const res = await requestWithAuth(app)
          .post(endpoint)
          .send({ ...base, profilePicture })
          .set("Authorization", "Bearer test_api_token");

        expect(res.status).toBe(successCode);
        await expect(getProfilePicture(res.body as R)).resolves.toBe(
          resProfilePicture,
        );
      });
    });

    test("Invalid base64", async () => {
      const res = await requestWithAuth(app)
        .post(endpoint)
        .send({ ...base, profilePicture: "as;lkdfj'z=['/-ф" })
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual({
        success: false,
        error: "Unknown image format",
      });
    });

    test("Invalid image", async () => {
      const profilePicture = readStaticFile("not_an_image.txt");

      const res = await requestWithAuth(app)
        .post(endpoint)
        .send({ ...base, profilePicture })
        .set("Authorization", "Bearer test_api_token");

      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual({
        success: false,
        error: "Unknown image format",
      });
    });
  });
}
