import type { Query } from "./db_client.js";
import type { MongoDBItem, ObjectId, Sport } from "./utils.js";

export enum MatchStatus {
  Request = "requested",
  Accepted = "accepted",
  Complete = "completed",
}

export interface Message {
  sender: string;
  date: Date;
  text: string;
}

interface BaseMatch extends MongoDBItem {
  date: Date;
  messages: Message[];
  owner: ObjectId;
  players: ObjectId[];
  sport: Sport;
}

interface MatchWithoutScore extends BaseMatch {
  status: MatchStatus.Accepted | MatchStatus.Request;
}

interface MatchWithScore extends BaseMatch {
  // Maps player id to score
  score: Record<string, number>;
  status: MatchStatus.Complete;
}

interface LeagueInfo {
  league: ObjectId;
  round: number;
}

type LeagueMatch<T> = LeagueInfo & T;

type MatchWithStatus = MatchWithScore | MatchWithoutScore;

export type Match = MatchWithStatus | LeagueMatch<MatchWithStatus>;

interface BaseMatchProposal {
  date: Date;
  to: ObjectId;
  sport: Sport;
}

export type MatchProposal = LeagueMatch<BaseMatchProposal> | BaseMatchProposal;

export type MatchQuery = Query<{
  league: ObjectId;
  players: ObjectId[];
  round: number;
  sport: Sport;
  status: MatchStatus;
}>;

export interface CensoredLeagueMatch {
  date: Date;
  league: ObjectId;
  round: number;
  players: ObjectId[];
  sport: Sport;
  score?: Record<string, number>;
  status: MatchStatus.Complete | MatchStatus.Accepted;
}
