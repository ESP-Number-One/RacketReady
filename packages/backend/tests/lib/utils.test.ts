import { describe, expect, test } from "@jest/globals";
import { ObjectId, tests } from "@esp-group-one/types";
import type { Request } from "express";
import type { VerifyJwtResult } from "access-token-jwt";
import {
  getUserId,
  mapUser,
  safeEqual,
  setUserId,
} from "../../src/lib/utils.js";
import { addUser } from "../helpers/utils.js";
import { setup, withDb } from "../helpers/controller.js";

const { IDS } = tests;

setup();

const auth0Id = "github|123456";

describe("getUserId", () => {
  test("exists", async () => {
    await withDb(async (db) => {
      const user = await addUser(db, auth0Id);
      const req = { auth0Id } as Request;
      await expect(getUserId(db, req)).resolves.toStrictEqual(user._id);
    });
  });

  test("user doesn't exist", async () => {
    await withDb(async (db) => {
      const req = { auth0Id: "github|123456" } as Request;
      await expect(getUserId(db, req)).resolves.toBe(undefined);
    });
  });

  test("id not set", async () => {
    await withDb(async (db) => {
      const req = {} as Request;
      await expect(getUserId(db, req)).rejects.toThrow();
    });
  });
});

describe("mapUser", () => {
  test("id set", async () => {
    await withDb(async (db) => {
      const req = { auth0Id } as Request;
      await expect(
        mapUser(db, req, new ObjectId(IDS[0])),
      ).resolves.not.toThrow();

      const coll = db.userMap();
      await expect((await coll).find({})).resolves.toStrictEqual([
        {
          _id: expect.any(ObjectId),
          auth0Id,
          internalId: new ObjectId(IDS[0]),
        },
      ]);
    });
  });

  test("id not set", async () => {
    await withDb(async (db) => {
      const req = {} as Request;
      await expect(mapUser(db, req, new ObjectId(IDS[0]))).rejects.toThrow();
    });
  });
});

describe("setUserId", () => {
  test("from param", () => {
    const req = {} as Request;
    setUserId(req, { payload: { sub: auth0Id } } as VerifyJwtResult);
    expect(req.auth0Id).toBe(auth0Id);
  });

  test("from ret", () => {
    const req = {} as Request;
    const ret = setUserId(req, {
      payload: { sub: auth0Id },
    } as VerifyJwtResult);
    expect(ret.auth0Id).toBe(auth0Id);
  });

  test("throws without id", () => {
    const req = {} as Request;
    expect(() => setUserId(req, { payload: {} } as VerifyJwtResult)).toThrow();
  });
});

describe("safeEqual", () => {
  const myTests: [string, string, boolean][] = [
    ["s", "s", true],
    ["", "", true],
    ["hi", "no", false],
    ["hello there how are you", "", false],
    ["", "hi there", false],
    ["hi there", "hi there", true],
  ];

  myTests.forEach(([a, b, res]) => {
    test(`cmp "${a}" === "${b}"`, () => {
      expect(safeEqual(a, b)).toBe(res);
    });
  });
});
