import { afterAll, beforeAll, beforeEach, expect } from "@jest/globals";
import type { MongoDBItem } from "@esp-group-one/types";
import { DbClient, helpers } from "@esp-group-one/db-client";
import { resetCollections } from "./db.js";

export function idCmp<T extends MongoDBItem>(a: T, b: T): number {
  return a._id.mongoDbId.localeCompare(b._id.mongoDbId);
}

/**
 * Compares an array without taking positions into account
 */
export function compareBag<T>(
  got: T[],
  expected: T[],
  cmp?: (a: T, b: T) => number,
) {
  expect(got.sort(cmp)).toStrictEqual(expected.sort(cmp));
}

/**
 * Allows you to easily setup a DB and have it properly closed once the tests
 * are over
 */
export class TestDb {
  #db: DbClient | undefined;

  constructor() {
    beforeAll(() => {
      helpers.setup();
      this.#db = new DbClient();
    });

    beforeEach(async () => {
      await this.reset();
    });

    afterAll(async () => {
      await this.#db?.close();
    });
  }

  get(): DbClient {
    return this.#db as unknown as DbClient;
  }

  async reset(): Promise<void> {
    await resetCollections(this.get());
  }
}
