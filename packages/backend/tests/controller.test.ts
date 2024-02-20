import type { FilterOptions } from "@esp-group-one/db-client";
import { DbClient, tests as dbTests } from "@esp-group-one/db-client";
import { beforeAll, afterAll, describe, expect, test } from "@jest/globals";
import type { MongoClient, OptionalId } from "mongodb";
import type { MongoDBItem, User, WithError } from "@esp-group-one/types";
import { ObjectId, tests as typesTests } from "@esp-group-one/types";
import type { Request } from "express";
import { CollectionWrap } from "@esp-group-one/db-client/build/src/collection.js";
import { ControllerWrap } from "../src/controller.js";

const { getRawClient, getRawDb, setup } = dbTests;
const { IDS } = typesTests;

interface TestObj extends MongoDBItem {
  name: string;
  num: number;
}

class TestController extends ControllerWrap<TestObj> {
  getCollection(): Promise<CollectionWrap<TestObj>> {
    return Promise.resolve(
      new CollectionWrap<TestObj>(getRawDb(client).collection("test")),
    );
  }

  notFound<R>(status?: number, message?: string): WithError<R> {
    return super.notFound(status, message);
  }

  get(objId: ObjectId): Promise<WithError<TestObj>> {
    return super.get(objId);
  }

  find(query: FilterOptions<TestObj>): Promise<WithError<TestObj[]>> {
    return super.find(query);
  }

  create(obj: OptionalId<TestObj>): Promise<WithError<TestObj>> {
    return super.create(obj);
  }

  withUserId<R>(
    req: Request,
    callback: (user: ObjectId) => Promise<WithError<R>>,
  ): Promise<WithError<R>> {
    return this.withUserId(req, callback);
  }

  withUser<R>(
    req: Request,
    callback: (user: User) => Promise<WithError<R>>,
  ): Promise<WithError<R>> {
    return this.withUser(req, callback);
  }
}

let db: DbClient;
let client: MongoClient;
let controller: TestController;
beforeAll(async () => {
  setup();

  db = new DbClient();
  client = await getRawClient();
});

beforeEach(async () => {
  const collections = await getRawDb(client).collections();
  const promises = [];
  for (const c of collections) {
    promises.push(c.deleteMany());
  }
  await Promise.all(promises);
  controller = new TestController();
});

afterEach(async () => {
  await controller.closeDb();
});

afterAll(async () => {
  await db.close();
  await client.close();
});

describe("notFound", () => {
  test("with message", () => {
    expect(controller.notFound(300, "message")).toStrictEqual({
      success: false,
      error: "message",
    });
    expect(controller.getStatus()).toBe(300);
  });

  test("without message", () => {
    expect(controller.notFound()).toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });
    expect(controller.getStatus()).toBe(404);
  });
});

describe("get", () => {
  test("found", async () => {
    const coll = await controller.getCollection();
    const obj = {
      name: "Sam",
      num: 10,
    };

    const id = (await coll.insert(obj))[0];
    expect(await controller.get(id)).toStrictEqual({
      success: true,
      data: { _id: id, ...obj },
    });

    expect(controller.getStatus()).toBe(200);
  });

  test("not found", async () => {
    expect(await controller.get(new ObjectId(IDS[0]))).toStrictEqual({
      success: false,
      error: "Failed to find Obj",
    });
    expect(controller.getStatus()).toBe(404);
  });
});

describe("find", () => {
  test("found", async () => {
    const coll = await controller.getCollection();
    const objs: TestObj[] = [];
    const promises = [];
    for (let i = 0; i < 10; i++) {
      const obj = {
        name: `Sam-${i}`,
        num: i,
      };
      promises.push(
        coll.insert(obj).then((id) => {
          objs.push({ _id: id[0], ...obj });
        }),
      );
    }
    await Promise.all(promises);

    expect(await controller.find({})).toStrictEqual({
      success: true,
      data: objs,
    });

    expect(
      await controller.find({ pageSize: 10, pageStart: 10 }),
    ).toStrictEqual({
      success: true,
      data: objs.slice(10),
    });

    expect(controller.getStatus()).toBe(200);
  });

  test("nothing", async () => {
    expect(await controller.find({})).toStrictEqual({
      success: true,
      data: [],
    });

    expect(controller.getStatus()).toBe(200);
  });

  test("error", async () => {
    expect(await controller.find({})).toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });

    expect(controller.getStatus()).toBe(500);
  });
});
