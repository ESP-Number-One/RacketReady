import {
  type Db,
  type Collection,
  type Document,
  type Filter,
  MongoClient,
} from "mongodb";
import type { League, Match, User } from "@esp-group-one/types";
import {
  LEAGUE_COLLECTION_NAME,
  MATCH_COLLECTION_NAME,
  USER_COLLECTION_NAME,
  getDbName,
  getUrl,
} from "./constants.js";

export interface Collections {
  users: Collection;
  leagues: Collection;
  matches: Collection;
}

export class DbClient {
  #client: MongoClient;
  #db: Promise<Db>;
  #url = "";
  #users?: Collection;
  #leagues?: Collection;
  #matches?: Collection;
  dbName = "";

  constructor(url?: string, dbName?: string) {
    this.#url = url ?? getUrl();
    this.dbName = dbName ?? getDbName();
    this.#client = new MongoClient(this.#url);
    this.#db = this.#connect();
  }

  async findLeagues(query: Filter<Document>): Promise<League[]> {
    return (await this.#find(await this.leagueColl(), query)) as League[];
  }

  async findMatches(query: Filter<Document>): Promise<Match[]> {
    return (await this.#find(await this.matchesColl(), query)) as Match[];
  }

  async findUsers(query: Filter<Document>): Promise<User[]> {
    return (await this.#find(await this.usersColl(), query)) as User[];
  }

  async leagueColl(): Promise<Collection> {
    const db = await this.#db;

    if (!this.#leagues) this.#leagues = db.collection(LEAGUE_COLLECTION_NAME);

    return this.#leagues;
  }

  async matchesColl(): Promise<Collection> {
    const db = await this.#db;

    if (!this.#matches) this.#matches = db.collection(MATCH_COLLECTION_NAME);

    return this.#matches;
  }

  async usersColl(): Promise<Collection> {
    const db = await this.#db;

    if (!this.#users) this.#users = db.collection(USER_COLLECTION_NAME);

    return this.#users;
  }

  /**
   * Connects to the database and returns the DB we are looking for.
   *
   * This should only be called in the constructor
   */
  async #connect(): Promise<Db> {
    await this.#client.connect();

    return this.#client.db(this.dbName);
  }

  /**
   * This runs find on collection with the given query and converts the type to
   * unknown to make it easier to process
   */
  async #find(coll: Collection, query: Filter<Document>): Promise<unknown[]> {
    return (await coll.find(query).toArray()) as unknown[];
  }
}
