import type { FilterOptions } from "@esp-group-one/db-client";
import { tests as dbTests } from "@esp-group-one/db-client";
import { describe, expect, test } from "@jest/globals";
import type { OptionalId } from "mongodb";
import type { MongoDBItem, WithError, User } from "@esp-group-one/types";
import {
  ObjectId,
  newAPISuccess,
  tests as typesTests,
} from "@esp-group-one/types";
import type { Request } from "express";
import { CollectionWrap } from "@esp-group-one/db-client/build/src/collection.js";
import { ControllerWrap } from "../../src/controller.js";
import { addUser, compareBag, idCmp } from "../helpers/utils.js";
import { setup, withDb, withRawDb } from "../helpers/controller.js";

const { getRawDb } = dbTests;
const { IDS } = typesTests;

interface TestObj extends MongoDBItem {
  name: string;
  num: number;
}

class TestController extends ControllerWrap<TestObj> {
  getCollection(): Promise<CollectionWrap<TestObj>> {
    return Promise.resolve(
      withRawDb<CollectionWrap<TestObj>>(
        (client) =>
          new CollectionWrap<TestObj>(getRawDb(client).collection("test")),
      ),
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
    return super.withUserId(req, callback);
  }

  withUser<R>(
    req: Request,
    callback: (user: User) => Promise<WithError<R>>,
  ): Promise<WithError<R>> {
    return super.withUser(req, callback);
  }

  withVerifiedParam<P, R>(
    p: P,
    callback: (p: P) => Promise<WithError<R>>,
  ): Promise<WithError<R>> {
    return super.withVerifiedParam(p, callback);
  }

  catchInternalServerError<R>(
    promise: Promise<WithError<R>>,
  ): Promise<WithError<R>> {
    return super.catchInternalServerError(promise);
  }
}

setup();

let controller: TestController;

beforeEach(() => {
  controller = new TestController();
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
    await expect(controller.get(id)).resolves.toStrictEqual({
      success: true,
      data: { _id: id, ...obj },
    });

    expect(controller.getStatus()).toBe(undefined);
  });

  test("not found", async () => {
    await expect(controller.get(new ObjectId(IDS[0]))).resolves.toStrictEqual({
      success: false,
      error: "Failed to get obj",
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

    const noPageRes = await controller.find({});
    expect(noPageRes.success).toBe(true);
    if (noPageRes.success) {
      compareBag(noPageRes.data, objs, idCmp);
    }

    const pageRes = await controller.find({ pageSize: 10, pageStart: 10 });
    expect(pageRes.success).toBe(true);
    if (pageRes.success) {
      compareBag(pageRes.data, objs.slice(10), idCmp);
    }
  });

  test("nothing", async () => {
    await expect(controller.find({})).resolves.toStrictEqual({
      success: true,
      data: [],
    });
  });

  test("error", async () => {
    await expect(
      controller.find({ query: { _id: { $and: [null] } } }),
    ).resolves.toStrictEqual({
      success: false,
      error: "Failed to get obj",
    });

    expect(controller.getStatus()).toBe(500);
    expect(controller.getStatus()).toBe(500);
  });
});

describe("create", () => {
  test("success", async () => {
    const obj = {
      name: "Hi there",
      num: 23,
    };

    await expect(controller.create(obj)).resolves.toStrictEqual({
      success: true,
      data: {
        _id: expect.any(ObjectId),
        ...obj,
      },
    });
  });

  // test("errored", async () => {});
});

describe("withUserId", () => {
  test("found", async () => {
    await withDb(async (db) => {
      const auth0Id = "github|123456";
      const user = await addUser(db, auth0Id);

      const req = getFakeReq(auth0Id);
      const res = controller.withUserId(req, (id) =>
        Promise.resolve(newAPISuccess(id)),
      );

      await expect(res).resolves.toStrictEqual({
        success: true,
        data: user._id,
      });
      expect(controller.getStatus()).toBe(undefined);
    });
  });

  test("not found", async () => {
    const req = getFakeReq();
    const res = controller.withUserId(req, (id) =>
      Promise.resolve(newAPISuccess(id)),
    );

    await expect(res).resolves.toStrictEqual({
      success: false,
      error: "Unknown User",
    });
    expect(controller.getStatus()).toBe(404);
  });

  test("Error", async () => {
    await withDb(async (db) => {
      const auth0Id = "github|123456";
      const _ = await addUser(db, auth0Id);

      const req = getFakeReq(auth0Id);
      const res = controller.withUserId(req, () =>
        Promise.reject(new Error("Some random error")),
      );

      await expect(res).resolves.toStrictEqual({
        success: false,
        error: "Internal Server Error",
      });
      expect(controller.getStatus()).toBe(500);
    });
  });
});

describe("withUser", () => {
  test("found", async () => {
    await withDb(async (db) => {
      const auth0Id = "github|123456";
      const user = await addUser(db, auth0Id);

      const req = getFakeReq(auth0Id);
      const res = controller.withUser(req, (u) =>
        Promise.resolve(newAPISuccess(u)),
      );

      await expect(res).resolves.toStrictEqual({
        success: true,
        data: user,
      });
      expect(controller.getStatus()).toBe(undefined);
    });
  });

  test("not found", async () => {
    const req = getFakeReq();
    const res = await controller.withUser(req, (u) =>
      Promise.resolve(newAPISuccess(u)),
    );

    expect(controller.getStatus()).toBe(404);
    expect(res).toStrictEqual({
      success: false,
      error: "Unknown User",
    });
  });

  test("user not found (map is)", async () => {
    await withDb(async (db) => {
      const auth0Id = "github|123456";
      await (
        await db.userMap()
      ).insert({ auth0Id, internalId: new ObjectId(IDS[0]) });

      const req = getFakeReq(auth0Id);
      const res = await controller.withUser(req, (u) =>
        Promise.resolve(newAPISuccess(u)),
      );

      expect(controller.getStatus()).toBe(404);
      expect(res).toStrictEqual({
        success: false,
        error: "Could not get user",
      });
    });
  });

  test("Error", async () => {
    await withDb(async (db) => {
      const auth0Id = "github|123456";
      const _ = await addUser(db, auth0Id);

      const req = getFakeReq(auth0Id);
      const res = controller.withUser(req, () =>
        Promise.reject(new Error("Some random error")),
      );

      await expect(res).resolves.toStrictEqual({
        success: false,
        error: "Internal Server Error",
      });
      expect(controller.getStatus()).toBe(500);
    });
  });
});

describe("withVerifiedParam", () => {
  test("valid", async () => {
    const param = { mongoDbId: IDS[0] };
    const res = await controller.withVerifiedParam(param, (conv) =>
      Promise.resolve(newAPISuccess(conv)),
    );

    expect(controller.getStatus()).toBe(undefined);
    expect(res).toStrictEqual({
      success: true,
      data: new ObjectId(IDS[0]),
    });
  });

  test("invalid", async () => {
    const param = { mongoDbId: "aaa" };
    const res = controller.withVerifiedParam(param, (conv) =>
      Promise.resolve(newAPISuccess(conv)),
    );

    await expect(res).resolves.toStrictEqual({
      success: false,
      error: "Invalid request",
    });
    expect(controller.getStatus()).toBe(400);
  });

  test("with error", async () => {
    const param = { mongoDbId: IDS[0] };
    const res = controller.withVerifiedParam(param, (_) =>
      Promise.reject(new Error("Ahhh")),
    );

    await expect(res).resolves.toStrictEqual({
      success: false,
      error: "Internal Server Error",
    });
    expect(controller.getStatus()).toBe(500);
  });
});

describe("catchInternalServerError", () => {
  test("pass through", async () => {
    const success = newAPISuccess("Yay");
    const res = controller.catchInternalServerError(Promise.resolve(success));

    await expect(res).resolves.toStrictEqual(success);
    expect(controller.getStatus()).toBe(undefined);
  });

  test("rejection", async () => {
    const res = controller.catchInternalServerError(
      Promise.reject(new Error("Ahhh")),
    );

    await expect(res).resolves.toStrictEqual({
      success: false,
      error: "Internal Server Error",
    });
    expect(controller.getStatus()).toBe(500);
  });
});

function getFakeReq(auth0Id?: string): Request {
  return { auth0Id } as unknown as Request;
}
