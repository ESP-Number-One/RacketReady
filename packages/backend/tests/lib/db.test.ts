import { afterEach, describe, expect, test } from "@jest/globals";
import * as db from "@esp-group-one/db-client";
import { closeDb, getDb } from "../../src/lib/db.js";

// So mongodb doesn't complain
beforeAll(() => {
  db.tests.setup();
});

// Makes sure the db is properly closed after all
afterEach(async () => {
  await closeDb();
});

describe("opening", () => {
  test("no dupliction", () => {
    expect(getDb()).toStrictEqual(getDb());
  });
});

describe("closing", () => {
  test("after creation", async () => {
    const orig = getDb();
    await closeDb();
    expect(getDb()).not.toBe(orig);
    expect(orig.isClosed()).toBe(true);
  });

  test("don't create", async () => {
    const closeWrap = async () => {
      await closeDb();
      return true;
    };
    await expect(closeWrap()).resolves.toBe(true);
  });
});
