import type { CollectionWrap } from "@esp-group-one/db-client/build/src/collection.js";
import { newAPIError, newAPISuccess } from "@esp-group-one/types";
import type {
  ObjectId,
  MongoDBItem,
  WithError,
  User,
} from "@esp-group-one/types";
import type { OptionalId } from "mongodb";
import type { Request } from "express";
import { Controller } from "tsoa";
import { DbClient, type FilterOptions } from "@esp-group-one/db-client";
import { getUserId } from "./lib/utils.js";

/**
 * This class offers basically functions which implement the APIs for all
 * controllers and implemented using generics so you can easily inherit
 *
 * To inherit you must implement:
 *
 * - creationToObj
 * - getCollection
 *
 * As well as all the API endpoints (however they should be able to simply
 * pass their arguments on to the functions below)
 */
export class ControllerWrap<T extends MongoDBItem> extends Controller {
  /**
   * @returns the collection which should be used for all operations
   */
  getCollection(): Promise<CollectionWrap<T>> {
    throw Error("Unimplemented");
  }

  protected notFound<R>(status?: number, message?: string): WithError<R> {
    this.setStatus(status ?? 404);
    return newAPIError(message ?? "Failed to get obj");
  }

  /**
   * Safely gets an object and converts it to a response. This will not error
   * out and so you can safely await the function
   */
  protected async get(objId: ObjectId): Promise<WithError<T>> {
    return (await this.getCollection())
      .get(objId)
      .then((obj): WithError<T> => {
        if (!obj) throw new Error("Id does not exist");
        return newAPISuccess(obj);
      })
      .catch((e) => {
        console.error(`Failed to get obj with id: ${objId.toString()}: ${e}`);
        return this.notFound();
      });
  }

  /**
   * Safely finds the information for the current endpoints collection, if
   * none is found it will just return an error
   */
  protected async find(query: FilterOptions<T>): Promise<WithError<T[]>> {
    return (await this.getCollection())
      .page(query)
      .then((objs): WithError<T[]> => {
        return newAPISuccess(objs);
      })
      .catch((e) => {
        console.error(
          `Failed to get with query: ${JSON.stringify(query)}: ${e}`,
        );

        return this.notFound(500);
      });
  }

  /**
   * Safely creates a new object for the controller. However does not check if
   * object exists already
   */
  protected async create(obj: OptionalId<T>): Promise<WithError<T>> {
    this.setStatus(201);

    return (await this.getCollection())
      .insert(obj)
      .then((res) => {
        this.setStatus(201);
        return newAPISuccess({
          ...obj,
          _id: res[0].toString(),
        } as T);
      })
      .catch((e) => {
        this.setStatus(500);
        console.error(
          `Error when creating obj with args: ${JSON.stringify(obj)}: ${e}`,
        );

        return newAPIError("Failed to create new obj");
      });
  }

  /**
   * Gets the current user id and calls the callback if we are able to find
   * one, if not we return an Error
   * @param req - The request made to the endpoint to extract the user ID from
   * @param callback - The function where you can use the userId knowing the
   *   user does, in fact, exist which returns a response which we will pass
   *   back to the returns
   *
   * @returns A response object which the callback has returned or an error if
   *   we could not get the user id
   */
  protected async withUserId<R>(
    req: Request,
    callback: (user: ObjectId) => Promise<WithError<R>>,
  ): Promise<WithError<R>> {
    return getUserId(req)
      .then((res) => {
        if (res) return callback(res);
        throw new Error("Could not get user");
      })
      .catch((e) => {
        this.setStatus(500);
        console.error(`Error when running with User: ${e}`);

        return newAPIError("Unknown User");
      });
  }

  protected async withUser<R>(
    req: Request,
    callback: (user: User) => Promise<WithError<R>>,
  ): Promise<WithError<R>> {
    return this.withUserId(req, async (userId) => {
      const db = new DbClient();
      const userColl = await db.users();
      const user = await userColl.get(userId);
      if (user) return callback(user);
      throw new Error("Could not get user");
    });
  }
}
