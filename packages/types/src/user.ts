import type { PageOptions, Query, SortQuery } from "./db_client.js";
import type { DateTimeString, MongoDBItem, ObjectId, Sport } from "./utils.js";

export enum AbilityLevel {
  Beginner = "beginner",
  Intermediate = "intermediate",
  Advanced = "advanced",
}

export type StarCount = 1 | 2 | 3 | 4 | 5;
export type Ratings = Record<StarCount, number>;

export interface SportInfo {
  sport: Sport;
  ability: AbilityLevel;
}

export interface Duration {
  days?: number;
  weeks?: number;
  months?: number;
  years?: number;
}

export interface Availability {
  timeStart: DateTimeString;
  timeEnd: DateTimeString;
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
  rating: Ratings;
}

export interface CensoredUser extends MongoDBItem {
  name: string;
  description: string;
  sports: SportInfo[];
  rating: Ratings;
}

export function censorUser(user: User): CensoredUser {
  return {
    _id: user._id,
    name: user.name,
    description: user.description,
    sports: user.sports,
    rating: user.rating,
  };
}

export interface UserCreation {
  name: string;
  description: string;
  email: string;
  profilePicture: string;
}

export type UserQuery = Query<{
  _id: ObjectId;
  sports: string[];
  leagues: ObjectId[];
}> & { profileText?: string };

export function calculateAverageRating(rate: Ratings): number {
  const count = Object.values(rate).reduce((a, b) => a + b, 0);
  const sum = Object.entries(rate)
    .map(([stars, ratings]) => Number(stars) * ratings)
    .reduce((a, b) => a + b, 0);

  return sum / count;
}

export type UserPageOptions = PageOptions<UserQuery, SortQuery<User>>;
