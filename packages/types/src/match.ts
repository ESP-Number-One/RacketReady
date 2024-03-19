import type { PageOptions, Query, SortQuery } from "./db_client.js";
import type {
  DateTimeString,
  ID,
  MongoDBItem,
  ObjectId,
  Sport,
} from "./utils.js";

export enum MatchStatus {
  Request = "requested",
  Accepted = "accepted",
  Complete = "completed",
}

export interface Message {
  sender: ObjectId;
  date: DateTimeString;
  text: string;
}

interface BaseMatch extends MongoDBItem {
  date: DateTimeString;
  messages: Message[];
  owner: ObjectId;
  players: ObjectId[];
  sport: Sport;
}

interface MatchWithoutScore extends BaseMatch {
  status: MatchStatus.Accepted | MatchStatus.Request;
}

export type Scores = Record<ID, number>;
export interface MatchWithScore extends BaseMatch {
  // Maps player id to score
  score: Scores;
  status: MatchStatus.Complete;
  usersRated: ObjectId[];
}

interface LeagueInfo {
  league: ObjectId;
  round: number;
}

type LeagueMatch<T> = LeagueInfo & T;

type MatchWithStatus = MatchWithScore | MatchWithoutScore;

export type Match = MatchWithStatus | LeagueMatch<MatchWithStatus>;

interface BaseMatchProposal {
  date: DateTimeString;
  to: ObjectId;
  sport: Sport;
}

export type MatchProposal = BaseMatchProposal;

export type MatchQuery = Query<{
  league: ObjectId;
  players: ObjectId[];
  round: number;
  sport: Sport;
  status: MatchStatus;
  date: DateTimeString;
}>;

export interface CensoredLeagueMatch {
  date: string;
  league: ObjectId;
  round: number;
  players: ObjectId[];
  sport: Sport;
  score?: Record<string, number>;
  status: MatchStatus.Complete | MatchStatus.Accepted;
}

export type MatchPageOptions = PageOptions<MatchQuery, SortQuery<Match>>;
