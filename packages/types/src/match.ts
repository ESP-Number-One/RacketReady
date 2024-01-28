import type { ObjectId } from "mongodb";
import type { Sport } from "./utils.js";

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

export interface Match {
  _id: ObjectId;
  date: Date;
  owner: ObjectId;
  // Maps player id to score
  score?: Record<string, number>;
  status: MatchStatus;
  sport: Sport;
  players: ObjectId[];
  messages: Message[];
  league?: ObjectId;
}

export interface MatchProposal {
  date: Date;
  sport: Sport;
  owner: ObjectId;
  players: ObjectId[];
  league?: ObjectId;
}
