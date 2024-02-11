import { type Db, MongoClient } from "mongodb";
import type { League, Match, User, UserIdMap } from "@esp-group-one/types";
import {
  LEAGUE_COLLECTION_NAME,
  MATCH_COLLECTION_NAME,
  USER_COLLECTION_NAME,
  USER_MAP_COLLECTION_NAME,
  getDbName,
  getUrl,
} from "./constants.js";
import { CollectionWrap } from "./collection.js";

export class DbClient {
  public dbName = "";
  private client: MongoClient;
  private db: Promise<Db>;
  private url = "";
  private usersCache?: CollectionWrap<User>;
  private usersMapCache?: CollectionWrap<UserIdMap>;
  private leaguesCache?: CollectionWrap<League>;
  private matchesCache?: CollectionWrap<Match>;

  constructor(url?: string, dbName?: string) {
    this.url = url ?? getUrl();
    this.dbName = dbName ?? getDbName();
    this.client = new MongoClient(this.url);
    this.db = this.connect();
  }

  public async leagues(): Promise<CollectionWrap<League>> {
    const db = await this.db;

    if (!this.leaguesCache)
      this.leaguesCache = new CollectionWrap(
        db.collection(LEAGUE_COLLECTION_NAME),
      );

    return this.leaguesCache;
  }

  public async matches(): Promise<CollectionWrap<Match>> {
    const db = await this.db;

    if (!this.matchesCache)
      this.matchesCache = new CollectionWrap(
        db.collection(MATCH_COLLECTION_NAME),
      );

    return this.matchesCache;
  }

  public async userMap(): Promise<CollectionWrap<UserIdMap>> {
    const db = await this.db;

    if (!this.usersMapCache)
      this.usersMapCache = new CollectionWrap(
        db.collection(USER_MAP_COLLECTION_NAME),
      );

    return this.usersMapCache;
  }

  public async users(): Promise<CollectionWrap<User>> {
    const db = await this.db;

    if (!this.usersCache)
      this.usersCache = new CollectionWrap(db.collection(USER_COLLECTION_NAME));

    return this.usersCache;
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
