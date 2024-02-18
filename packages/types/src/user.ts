import type { Query } from "./db_client.js";
import type { MongoDBItem, ObjectId, Sport } from "./utils.js";

export enum AbilityLevel {
  Beginner = "beginner",
  Intermediate = "intermediate",
  Advanced = "advanced",
}

export interface SportInfo {
  sport: Sport;
  ability: string;
}

export interface Duration {
  days?: number;
  weeks?: number;
  months?: number;
  years?: number;
}

export interface Availability {
  timeStart: string;
  timeEnd: string;
  recurring?: Duration;
}

export interface UserIdMap extends MongoDBItem {
  auth0Id: string;
  internalId: ObjectId;
}

export interface User extends MongoDBItem {
  name: string;
  description: string;
  profilePicture: string;
  email: string;
  sports: SportInfo[];
  leagues: ObjectId[];
  availability: Availability[];
}

export interface CensoredUser extends MongoDBItem {
  name: string;
  description: string;
  sports: SportInfo[];
}

export function censorUser(user: User): CensoredUser {
  return {
    _id: user._id,
    name: user.name,
    description: user.description,
    sports: user.sports,
  };
}

export interface UserCreation {
  name: string;
  description: string;
  profilePicture: string;
  email: string;
}

export type UserQuery = Query<{
  profileText: string;
  sports: string[];
  leagues: ObjectId[];
}>;
