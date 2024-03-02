import { DbClient, tests as dbTests } from "@esp-group-one/db-client";
import type { Error, MongoDBItem, Success, User } from "@esp-group-one/types";
import { ObjectId, tests as typeTests } from "@esp-group-one/types";
import { beforeAll, afterAll, describe, expect, test } from "@jest/globals";
import type { MongoClient } from "mongodb";
import { closeDb } from "../../src/lib/db.js";
import { app } from "../../src/app.js";
import {
  addUser,
  compareBag,
  expectAPIRes,
  idCmp,
  requestWithAuth,
} from "./utils.js";

const { IDS } = typeTests;
const { getRawClient, getRawDb, setup: dbSetup } = dbTests;

const TEST_AUTH0_ID = "github|111111";
const AUTH_TOKEN = "Bearer test_api_token";

let db: DbClient;
let client: MongoClient;

async function resetCollections(): Promise<void> {
  const collections = await getRawDb(client).collections();
  const promises = [];
  for (const c of collections) {
    promises.push(c.deleteMany());
  }
  await Promise.all(promises);
}

export function setup() {
  beforeAll(async () => {
    dbSetup();

    db = new DbClient();
    client = await getRawClient();
  });

  beforeEach(resetCollections);

  afterAll(async () => {
    await closeDb();
    await db.close();
    await client.close();
  });
}

export function withDb<T>(func: (db: DbClient) => T): T {
  return func(db);
}

export function withRawDb<T>(func: (db: MongoClient) => T): T {
  return func(client);
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
  addObj: (db: DbClient, currUser: User, creation?: Creation) => Promise<T>;
  addCensoredObj: (db: DbClient, currUser: User) => Promise<Censored>;
  validateCreation: (db: DbClient, user: User) => Promise<void>;
}) {
  const PAGE_SIZE = 20;
  let currUser: User;

  beforeEach(async () => {
    currUser = await addUser(db, TEST_AUTH0_ID);
  });

  describe("find", () => {
    test("Found", async () => {
      const objsPromise = [];
      for (let i = 0; i < PAGE_SIZE; i++)
        objsPromise.push(addCensoredObj(db, currUser));

      const objs = await Promise.all(objsPromise);

      const res = await requestWithAuth(app, TEST_AUTH0_ID)
        .post(`${prefix}/find`)
        .send({ pageSize: PAGE_SIZE })
        .set("Authorization", AUTH_TOKEN);

      expect(res.statusCode).toBe(200);
      const body = ObjectId.fromObj(res.body) as Success<Censored[]>;
      expect(body.success).toBe(true);
      compareBag(body.data, objs, idCmp);

      // For validation that the given objs are not undefined
      expect(body.data.length).toBeGreaterThan(0);
    });

    // Due to the differences in query we cannot test it here so just test a malformed one
    test("Malformed Query", async () => {
      const res = await requestWithAuth(app, TEST_AUTH0_ID)
        .post(`${prefix}/find`)
        .send({
          query: { not_existant_id: new ObjectId(IDS[0]) },
          pageSize: PAGE_SIZE,
        })
        .set("Authorization", AUTH_TOKEN);

      expect(res.statusCode).toBe(400);
      expectAPIRes(res.body).toStrictEqual({});
    });

    test("None found", async () => {
      const res = await requestWithAuth(app, TEST_AUTH0_ID)
        .post(`${prefix}/find`)
        .send({ pageSize: PAGE_SIZE })
        .set("Authorization", AUTH_TOKEN);

      expect(res.statusCode).toBe(200);
      expectAPIRes(res.body).toStrictEqual({
        success: true,
        data: [],
      });
    });
  });

  describe("get", () => {
    test("Found", async () => {
      const obj = await addCensoredObj(db, currUser);
      expect(obj).not.toBe(undefined);

      const res = await requestWithAuth(app, TEST_AUTH0_ID)
        .get(`${prefix}/${obj._id.toString()}`)
        .set("Authorization", AUTH_TOKEN);

      expect(res.statusCode).toBe(200);
      expectAPIRes(res.body).toStrictEqual({
        success: true,
        data: obj,
      });
    });

    test("Not Found", async () => {
      const res = await requestWithAuth(app, TEST_AUTH0_ID)
        .get(`${prefix}/${IDS[0]}`)
        .set("Authorization", AUTH_TOKEN);

      expect(res.statusCode).toBe(404);
      expect(res.body).toStrictEqual({
        success: false,
        error: "Failed to get obj",
      });
    });

    test("Invalid ID", async () => {
      const res = await requestWithAuth(app, TEST_AUTH0_ID)
        .get(`${prefix}/a`)
        .set("Authorization", AUTH_TOKEN);

      expect(res.statusCode).toBe(400);
      expect(res.body).toStrictEqual({});
    });
  });

  describe("new", () => {
    if (!skipNewExists) {
      test("already exists", async () => {
        const creation = getCreation();
        if (dontAddUserOnCreation) await resetCollections();

        await addObj(db, currUser, creation);
        const res = await requestWithAuth(app, TEST_AUTH0_ID)
          .post(`${prefix}/new`)
          .send(creation as object)
          .set("Authorization", AUTH_TOKEN);

        expect(res.statusCode).toBe(409);
        const body = res.body as unknown as Error;
        expect(body.success).toBe(false);
      });
    }

    test("succeeded", async () => {
      const creation = getCreation();
      if (dontAddUserOnCreation) await resetCollections();

      const res = await requestWithAuth(app, TEST_AUTH0_ID)
        .post(`${prefix}/new`)
        .send(creation as object)
        .set("Authorization", AUTH_TOKEN);

      expect(res.statusCode).toBe(201);
      await validateCreation(db, currUser);
    });

    test("malformed", async () => {
      if (dontAddUserOnCreation) await resetCollections();

      const res = await requestWithAuth(app, TEST_AUTH0_ID)
        .post(`${prefix}/new`)
        .send({})
        .set("Authorization", AUTH_TOKEN);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({});
    });
  });

  describe("authentication", () => {
    test("No auth header", async () => {
      const res = await requestWithAuth(app, TEST_AUTH0_ID).get(
        `${prefix}/${IDS[0]}`,
      );
      expect(res.statusCode).toBe(401);
    });

    test("Not authorised", async () => {
      const res = await requestWithAuth(app, "")
        .get(`${prefix}/${IDS[0]}`)
        .set("Authorization", AUTH_TOKEN);
      expect(res.statusCode).toBe(401);
    });
  });
}
