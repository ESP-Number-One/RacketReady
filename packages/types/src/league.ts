import type { PageOptions, Query, SortQuery } from "./db_client.js";
import type { MongoDBItem, ObjectId, Sport } from "./utils.js";
import type { AbilityLevel, User } from "@esp-group-one/types";
interface BaseLeague extends MongoDBItem {
  name: string;
  ownerIds: ObjectId[];
  sport: Sport;
  round: number;
  people: User[];
}

export interface MatchProposal {
  ownerId: ObjectId;
  players: ObjectId[];
  abilityLevel: AbilityLevel;
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
  round: number;
  people: User[];
}

export interface CensoredLeague extends MongoDBItem {
  name: string;
  sport: Sport;
  private: boolean;
  round: number;
  people: User[];
}

export function censorLeague(league: League): CensoredLeague {
  return {
    _id: league._id,
    name: league.name,
    sport: league.sport,
    private: league.private,
    round: league.round,
    people: league.people,
  };
}

export type LeagueQuery = Query<{
  sport: Sport;
  name: string;
  round: number;
}> & { amIn?: boolean };

export type LeaguePageOptions = PageOptions<LeagueQuery, SortQuery<League>>;
