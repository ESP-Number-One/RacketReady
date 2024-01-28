import type { ObjectId } from "mongodb";
import type { Sport } from "./utils.js";

interface BaseLeague {
  _id: ObjectId;
  ownerIds: ObjectId[];
  name: string;
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

export type LeagueCreation =
  | Omit<PublicLeague, "_id">
  | Omit<PrivateLeague, "id">;
