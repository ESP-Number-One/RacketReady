import type { ObjectId } from "mongodb";
import type { Sport } from "./utils.js";

export interface League {
  id: ObjectId;
  ownerIds: ObjectId[];
  name: string;
  sport: Sport;
}
