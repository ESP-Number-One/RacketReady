import type { CollectionWrap } from "@esp-group-one/db-client/build/src/collection.js";
import {
  newAPIError,
  newAPISuccess,
  type WithError,
  type QueryOptions,
} from "@esp-group-one/types";
import type { ObjectId, OptionalId } from "mongodb";
import { Controller } from "tsoa";

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
export class ControllerWrap<T, C> extends Controller {
  /**
   * Converts a creation type to the type without the id
   */
  creationToObj(_: C): OptionalId<T> {
    throw Error("Unimplemented");
  }

  /**
   * @returns the collection which should be used for all operations
   */
  getCollection(): Promise<CollectionWrap<T>> {
    throw Error("Unimplemented");
  }

  protected async get(objId: ObjectId): Promise<WithError<T>> {
    return (await this.getCollection())
      .get(objId)
      .then((obj): WithError<T> => {
        return newAPISuccess(obj);
      })
      .catch((e) => {
        this.setStatus(500);
        console.error(`Failed to get obj with id: ${objId.toString()}: ${e}`);
        return newAPIError("Failed to get obj");
      });
  }

  protected async find(query: QueryOptions): Promise<WithError<T[]>> {
    return (await this.getCollection())
      .page(query)
      .then((objs): WithError<T[]> => {
        return newAPISuccess(objs);
      })
      .catch((e) => {
        this.setStatus(500);
        console.error(
          `Failed to get with query: ${JSON.stringify(query)}: ${e}`,
        );
        return newAPIError("Failed to get obj");
      });
  }

  protected async create(requestBody: C): Promise<WithError<T>> {
    this.setStatus(201);
    const obj = this.creationToObj(requestBody);

    return (await this.getCollection())
      .insert(obj)
      .then((res) => {
        this.setStatus(201);
        return newAPISuccess({ ...obj, _id: res.insertedIds[0] } as T);
      })
      .catch((e) => {
        this.setStatus(500);
        console.error(
          `Error when creating obj with args: ${JSON.stringify(obj)}: ${e}`,
        );

        return newAPIError("Failed to create new obj");
      });
  }
}
