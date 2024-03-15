import type { PageOptions, Query, SortQuery } from "./db_client.js";
import type { MongoDBItem, ObjectId, Sport } from "./utils.js";

interface BaseLeague extends MongoDBItem {
  name: string;
  ownerIds: ObjectId[];
  sport: Sport;
  round: number;
  picture: string | null;
}

interface PublicLeague extends BaseLeague {
  round: number;
  private: false;
}

interface PrivateLeague extends BaseLeague {
  private: true;
  round: number;
  inviteCode: string;
}

export type League = PublicLeague | PrivateLeague;

export interface LeagueCreation {
  name: string;
  sport: Sport;
  private: boolean;
  picture: string | null;
}

export interface CensoredLeague extends MongoDBItem {
  name: string;
  sport: Sport;
  private: boolean;
  round: number;
  picture: string | null;
}

export function censorLeague(league: League): CensoredLeague {
  return {
    _id: league._id,
    name: league.name,
    sport: league.sport,
    private: league.private,
    round: league.round,
    picture: league.picture,
  };
}

export type LeagueQuery = Query<{
  sport: Sport;
  name: string;
  round: number;
}> & { amIn?: boolean };

export type LeaguePageOptions = PageOptions<LeagueQuery, SortQuery<League>>;
