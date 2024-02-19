import { randomUUID } from "crypto";
import { TestEnvironment } from "jest-environment-node";
import { MongoMemoryServer } from "mongodb-memory-server";

export const MONGO = new MongoMemoryServer();

export default class MongoEnvironment extends TestEnvironment {
  /**
   *
   * @param {import("@jest/environment").JestEnvironmentConfig} config
   * @param {import("@jest/environment").EnvironmentContext} context
   */
  constructor(config, context) {
    super(config, context);
  }

  async setup() {
    // Start the database
    await MONGO.start();
    await super.setup();

    this.global.__MONGO_URI__ = MONGO.getUri();
    this.global.__MONGO_DB_NAME__ = randomUUID();
  }

  async teardown() {
    // Stop the database.
    await MONGO.stop();
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}
