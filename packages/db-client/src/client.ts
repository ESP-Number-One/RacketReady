import { type Db, MongoClient } from "mongodb";
import type { League, Match, User } from "@esp-group-one/types";
import {
  LEAGUE_COLLECTION_NAME,
  MATCH_COLLECTION_NAME,
  USER_COLLECTION_NAME,
  getDbName,
  getUrl,
} from "./constants.js";
import { CollectionWrap } from "./collection.js";

export class DbClient {
  public dbName = "";
  private client: MongoClient;
  private db: Promise<Db>;
  private url = "";
  private users_cache?: CollectionWrap<User>;
  private leagues_cache?: CollectionWrap<League>;
  private matches_cache?: CollectionWrap<Match>;

  constructor(url?: string, dbName?: string) {
    this.url = url ?? getUrl();
    this.dbName = dbName ?? getDbName();
    this.client = new MongoClient(this.url);
    this.db = this.connect();
  }

  public async leagues(): Promise<CollectionWrap<League>> {
    const db = await this.db;

    if (!this.leagues_cache)
      this.leagues_cache = new CollectionWrap(
        db.collection(LEAGUE_COLLECTION_NAME),
      );

    return this.leagues_cache;
  }

  public async matches(): Promise<CollectionWrap<Match>> {
    const db = await this.db;

    if (!this.matches_cache)
      this.matches_cache = new CollectionWrap(
        db.collection(MATCH_COLLECTION_NAME),
      );

    return this.matches_cache;
  }

  public async users(): Promise<CollectionWrap<User>> {
    const db = await this.db;

    if (!this.users_cache)
      this.users_cache = new CollectionWrap(
        db.collection(USER_COLLECTION_NAME),
      );

    return this.users_cache;
  }

  /**
   * Connects to the database and returns the DB we are looking for.
   *
   * This should only be called in the constructor
   */
  private async connect(): Promise<Db> {
    await this.client.connect();

    return this.client.db(this.dbName);
  }
}
