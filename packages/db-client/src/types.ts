// This is a file full of meta programming to try and hide the fact that we are
// wrapping mongodb

import * as types from "@esp-group-one/types";
import { type Filter, ObjectId } from "mongodb";

// Completely stolen from https://stackoverflow.com/questions/72190916/replace-a-specific-type-with-another-type-in-a-nested-object-typescript
type ReplaceType<Type, FromType, ToType> = Type extends object
  ? ReplaceTypes<Type, FromType, ToType>
  : Type extends FromType
    ? ToType
    : Type;

type ReplaceTypes<ObjType extends object, FromType, ToType> = {
  [KeyType in keyof ObjType]: ReplaceType<ObjType[KeyType], FromType, ToType>;
};

/**
 * Replaces all our types.ObjectId with ObjectId for the type so we can pass to
 * MongoDB
 */
export type ReplaceObjectId<T> = ReplaceType<T, types.ObjectId, ObjectId>;

/**
 * These are the types which can be passed directly to MongoDB
 */
export type User = ReplaceObjectId<types.User>;
export type League = ReplaceObjectId<types.League>;
export type Match = ReplaceObjectId<types.Match>;
export type UserIdMap = ReplaceObjectId<types.UserIdMap>;

/**
 * Uses the fact that we know "mongoDbId" is going to be in our object and is
 * going to be a string to determine whether it is types.ObjectId or not
 */
function isFakeObjectId(obj: object): obj is types.ObjectId {
  // This is a known property of our ObjectId
  //
  // We also have to check it this way due to the passing it through JSON
  // stringify + parse functions
  return "mongoDbId" in obj && typeof obj.mongoDbId === "string";
}

/**
 * @returns correctly converted value if it is a mongodb ID
 */
function toFakeObjectId<T>(e: T): types.ObjectId | T {
  if (e instanceof ObjectId) {
    return new types.ObjectId(e.toString());
  }
  return e;
}

/**
 * @returns correctly converted value if it is our fake id
 */
function toRealObjectId<T extends object>(e: T): ObjectId | T {
  if (isFakeObjectId(e)) {
    return new ObjectId(e.toString());
  }
  return e;
}

/**
 * Recursively runs a given convert function on all elements of the given type,
 * making sure to keep the structure.
 *
 * @param convert - A functions that must take in any and detect if it is the
 *   given type and convert it when necessary
 * @param obj - The object to recursively change all its property types
 *
 * @returns a correctly converted object
 */
function recursiveConvert<T, From extends object, To extends object>(
  convert: <R extends object>(e: R) => To | R,
  obj: T,
): ReplaceType<T, From, To> {
  if (obj instanceof Array) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- this function is meant for any
    return obj.map((e) => recursiveConvert(convert, e)) as ReplaceType<
      T,
      From,
      To
    >;
  } else if (obj instanceof Object) {
    const conv = convert(obj);
    if (conv !== obj) return conv as ReplaceType<T, From, To>;

    return Object.fromEntries(
      Object.entries(conv).map(([name, val]) => [
        name,
        recursiveConvert<unknown, From, To>(convert, val),
      ]),
    ) as ReplaceType<T, From, To>;
  }
  return obj as ReplaceType<T, From, To>;
}

/**
 * @returns the given object where any property with type
 *   {@link types.ObjectId} is converted to {@link ObjectId}
 */
export function toMongo<T>(obj: T): ReplaceObjectId<T> {
  return recursiveConvert<T, types.ObjectId, ObjectId>(toRealObjectId, obj);
}

/**
 * @returns the given object where any property with type
 *   {@link ObjectId} is converted to {@link types.ObjectId}
 */
export function toInternal<T>(obj: ReplaceObjectId<T>): T {
  return recursiveConvert<ReplaceObjectId<T>, ObjectId, types.ObjectId>(
    toFakeObjectId,
    obj,
  ) as T;
}

export interface FilterOptions<T> {
  query?: Filter<T>;
  sort?: types.SortQuery<T>;
  pageStart?: number;
  pageSize?: number;
}
