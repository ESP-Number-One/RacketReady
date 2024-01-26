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
  id: ObjectId;
  date: Date;
  score: [number, number] | null;
  status: MatchStatus;
  sport: Sport;
  players: ObjectId[];
  messages: Message[];
  league: ObjectId | null;
}
