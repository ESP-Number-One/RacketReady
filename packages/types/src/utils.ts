export enum Sport {
  Badminton = "badminton",
  Tennis = "tennis",
  Squash = "squash",
}

export class ObjectId {
  public mongoDbId: string;

  constructor(id: string) {
    this.mongoDbId = id;
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
}

export interface MongoDBItem {
  _id: ObjectId;
}
