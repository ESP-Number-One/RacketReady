/* eslint-disable tsdoc/syntax -- tsoa has custom tags */

/**
 * @minLength 24 input must be a 24 character hex string
 * @maxLength 24 input must be a 24 character hex string
 */
export type ID = string;

export enum Sport {
  Badminton = "badminton",
  Tennis = "tennis",
  Squash = "squash",
}

export class ObjectId {
  /**
   * @minLength 24 input must be a 24 character hex string
   * @maxLength 24 input must be a 24 character hex string
   */
  public mongoDbId: ID;

  constructor(id: ID) {
    this.mongoDbId = id.toLowerCase();
    if (!this.verify()) throw Error("Input must be a 24 character hex string");
  }

  public equals(o: ObjectId): boolean {
    return this.toString() === o.toString();
  }

  public toString(): string {
    return this.mongoDbId;
  }

  /**
   * This converts a string to an object, finding all the ObjectIds in it
   * and replacing them with proper instances
   */
  public static fromJSON(obj: string): unknown {
    return ObjectId.fromObj(JSON.parse(obj));
  }

  /**
   * This is the backend for {@link ObjectId.fromJSON} and takes in an object
   * and recursively searches for our ObjectIds and replaces them
   */
  public static fromObj(obj: unknown): unknown {
    if (!obj || typeof obj !== "object") return obj;

    if (obj instanceof Array) return obj.map((e) => ObjectId.fromObj(e));

    if (
      "mongoDbId" in obj &&
      Object.keys(obj).length === 1 &&
      typeof obj.mongoDbId === "string"
    )
      return new ObjectId(obj.mongoDbId);

    return Object.fromEntries(
      Object.entries(obj).map(([key, val]) => {
        return [key, ObjectId.fromObj(val)];
      }),
    );
  }

  private verify(): boolean {
    return (
      this.mongoDbId.length === 24 &&
      Boolean(/^[a-f0-9]+$/.exec(this.mongoDbId))
    );
  }
}

export function hasId(arr: ObjectId[], id: ObjectId): boolean {
  return arr.some((i) => i.equals(id));
}

/**
 * Prepares the base64 for \<img\> tag.
 * @param base64 The raw base64 string.
 * @returns Valid `src` for an `<img >` tag.
 */
export function makeWebP(base64: string): `data:image/webp;base64,${string}` {
  return `data:image/webp;base64,${base64}`;
}

export interface MongoDBItem {
  _id: ObjectId;
}

/**
 * @format date(time)
 * @isDateTime the string must be in the format of a datetime
 */
export type DateTimeString = string;
