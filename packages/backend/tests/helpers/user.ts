import type { TestDb } from "@esp-group-one/test-helpers";
import { addUser } from "@esp-group-one/test-helpers";
import type { ObjectId, User } from "@esp-group-one/types";
import type { App } from "supertest/types.js";
import type { UpdateFilter } from "mongodb";
import { requestWithAuth } from "./utils.js";

/**
 * Allows you to easily setup a DB and have it properly closed once the tests
 * are over
 */
export class TestUser {
  auth0Id: string;
  private user: User | undefined;
  private base: Partial<User>;
  private db: TestDb;

  constructor(db: TestDb, auth0Id?: string, base?: Partial<User>) {
    this.auth0Id = auth0Id ?? "github|12345";
    this.db = db;
    this.base = base ?? {};
    beforeEach(async () => {
      await this.setup();
    });
  }

  get(): User {
    if (!this.user)
      throw new Error("User is not defined, this is outside a test");

    return this.user;
  }

  id(): ObjectId {
    return this.get()._id;
  }

  async setup() {
    this.user = await addUser(this.db.get(), this.auth0Id, this.base);
  }

  async edit(query: UpdateFilter<User>) {
    const users = await this.db.get().users();
    await users.edit(this.get()._id, query);
  }

  request(app: App) {
    return requestWithAuth(app, this.auth0Id);
  }

  async update(): Promise<User> {
    const users = await this.db.get().users();
    this.user = await users.get(this.get()._id);
    return this.get();
  }
}
