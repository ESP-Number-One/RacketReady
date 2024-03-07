import type { Error, MongoDBItem, Success, User } from "@esp-group-one/types";
import { ObjectId } from "@esp-group-one/types";
import { afterAll, describe, expect, test } from "@jest/globals";
import {
  IDS,
  OIDS,
  TestDb,
  compareBag,
  idCmp,
} from "@esp-group-one/test-helpers";
import type { Db } from "mongodb";
import { closeDb } from "../../src/lib/db.js";
import { app } from "../../src/app.js";
import { expectAPIRes, requestWithAuth } from "./utils.js";
import { TestUser } from "./user.js";

const TEST_AUTH0_ID = "github|111111";

let db: TestDb;

export function setup(): TestDb {
  afterAll(async () => {
    await closeDb();
  });

  db = new TestDb();

  return db;
}

export async function withRawDb<T>(func: (db: Db) => T): Promise<T> {
  return func(await db.get().raw());
}

export function addCommonTests<
  T extends MongoDBItem,
  Censored extends MongoDBItem,
  Creation,
>({
  prefix,
  getCreation,
  dontAddUserOnCreation,
  skipNewExists,
  addObj,
  addCensoredObj,
  validateCreation,
}: {
  prefix: string;
  getCreation: () => Creation;
  dontAddUserOnCreation?: boolean;
  skipNewExists?: boolean;
  addObj: (currUser: User, creation?: Creation) => Promise<T>;
  addCensoredObj: (currUser: User) => Promise<Censored>;
  validateCreation: (user: User) => Promise<void>;
}) {
  const PAGE_SIZE = 20;
  const currUser = new TestUser(db, TEST_AUTH0_ID);

  describe("find", () => {
    test("Found", async () => {
      const objsPromise = [];
      for (let i = 0; i < PAGE_SIZE; i++)
        objsPromise.push(addCensoredObj(currUser.get()));

      const objs = await Promise.all(objsPromise);

      const res = await currUser
        .request(app)
        .post(`${prefix}/find`)
        .send({ pageSize: PAGE_SIZE });

      expect(res.statusCode).toBe(200);
      const body = ObjectId.fromObj(res.body) as Success<Censored[]>;
      expect(body.success).toBe(true);
      compareBag(body.data, objs, idCmp);

      // For validation that the given objs are not undefined
      expect(body.data.length).toBeGreaterThan(0);
    });

    // Due to the differences in query we cannot test it here so just test a malformed one
    test("Malformed Query", async () => {
      const res = await currUser
        .request(app)
        .post(`${prefix}/find`)
        .send({
          query: { not_existant_id: OIDS[0] },
          pageSize: PAGE_SIZE,
        });

      expect(res.statusCode).toBe(400);
      expectAPIRes(res.body).toStrictEqual({});
    });

    test("None found", async () => {
      const res = await currUser
        .request(app)
        .post(`${prefix}/find`)
        .send({ pageSize: PAGE_SIZE });

      expect(res.statusCode).toBe(200);
      expectAPIRes(res.body).toStrictEqual({
        success: true,
        data: [],
      });
    });
  });

  describe("get", () => {
    test("Found", async () => {
      const obj = await addCensoredObj(currUser.get());
      expect(obj).not.toBe(undefined);

      const res = await currUser
        .request(app)
        .get(`${prefix}/${obj._id.toString()}`);

      expect(res.statusCode).toBe(200);
      expectAPIRes(res.body).toStrictEqual({
        success: true,
        data: obj,
      });
    });

    test("Not Found", async () => {
      const res = await currUser.request(app).get(`${prefix}/${IDS[0]}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toStrictEqual({
        success: false,
        error: "Failed to get obj",
      });
    });

    test("Invalid ID", async () => {
      const res = await currUser.request(app).get(`${prefix}/a`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual({});
    });
  });

  describe("new", () => {
    if (!skipNewExists) {
      test("already exists", async () => {
        const creation = getCreation();
        if (dontAddUserOnCreation) await db.reset();

        await addObj(currUser.get(), creation);
        const res = await currUser
          .request(app)
          .post(`${prefix}/new`)
          .send(creation as object);

        expect(res.statusCode).toBe(409);
        const body = res.body as unknown as Error;
        expect(body.success).toBe(false);
      });
    }

    test("succeeded", async () => {
      const creation = getCreation();
      if (dontAddUserOnCreation) await db.reset();

      const res = await currUser
        .request(app)
        .post(`${prefix}/new`)
        .send(creation as object);

      expect(res.statusCode).toBe(201);
      await validateCreation(currUser.get());
    });

    test("malformed", async () => {
      if (dontAddUserOnCreation) await db.reset();

      const res = await currUser.request(app).post(`${prefix}/new`).send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({});
    });
  });

  describe("authentication", () => {
    test("No auth header", async () => {
      const res = await currUser
        .request(app)
        .get(`${prefix}/${IDS[0]}`)
        .unset("Authorization");

      expect(res.statusCode).toBe(401);
    });

    test("Not authorised", async () => {
      const res = await requestWithAuth(app, "").get(`${prefix}/${IDS[0]}`);

      expect(res.statusCode).toBe(401);
    });
  });
}
