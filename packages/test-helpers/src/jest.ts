import { afterAll, beforeAll, beforeEach } from "@jest/globals";
import { DbClient, helpers } from "@esp-group-one/db-client";
import { resetCollections } from "./db.js";

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
