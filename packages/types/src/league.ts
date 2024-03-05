import type { Query } from "./db_client.js";
import type { MongoDBItem, ObjectId, Sport } from "./utils.js";

interface BaseLeague extends MongoDBItem {
  name: string;
  ownerIds: ObjectId[];
  sport: Sport;
}

interface PublicLeague extends BaseLeague {
  private: false;
}

interface PrivateLeague extends BaseLeague {
  private: true;
  inviteCode: string;
}

export type League = PublicLeague | PrivateLeague;

export interface LeagueCreation {
  name: string;
  sport: Sport;
  private: boolean;
}

export interface CensoredLeague extends MongoDBItem {
  name: string;
  sport: Sport;
  private: boolean;
}

export function censorLeague(league: League): CensoredLeague {
  return {
    _id: league._id,
    name: league.name,
    sport: league.sport,
    private: league.private,
  };
}

export type LeagueQuery = Query<{
  sport: Sport;
  name: string;
}> & { amIn?: boolean };
