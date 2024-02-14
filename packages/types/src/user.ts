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
  recurring?: number;
}

export interface UserIdMap {
  _id: ObjectId;
  userId: string;
  internalId: ObjectId;
}

export interface User {
  _id: ObjectId;
  name: string;
  description: string;
  profilePicture: string;
  email: string;
  sports: SportInfo[];
  leagues: ObjectId[];
  availability: Availability[];
}

export interface CensoredUser {
  _id: ObjectId;
  name: string;
  description: string;
  sports: SportInfo[];
}

export interface UserCreation {
  name: string;
  description: string;
  profilePicture: string;
  email: string;
}

export function censorUser(user: User): CensoredUser {
  return {
    _id: user._id,
    name: user.name,
    description: user.description,
    sports: user.sports,
  };
}
