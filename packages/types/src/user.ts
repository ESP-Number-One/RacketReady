import type { ObjectId } from "mongodb";
import type { Sport } from "./utils.js";

export enum AbilityLevel {
  Beginner = "beginner",
  Intermediate = "intermediate",
  Advanced = "advanced",
}

export interface SportInfo {
  sport: Sport;
  ability: string;
}

export interface Availability {
  timeStart: Date;
  timeEnd: Date;
  // TODO: Look into using "Duration" objects from Momentjs
  recurring: number | null;
}

export interface User {
  id: ObjectId;
  name: string;
  email: string;
  sports: SportInfo[];
  leagues: ObjectId[];
  availability: Availability[];
}
