import type { DbClient } from "@esp-group-one/db-client";
import type { ObjectId } from "@esp-group-one/types";
import { UnauthorizedError, type VerifyJwtResult } from "access-token-jwt";
import type { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      auth0Id?: string;
    }
  }
}

/**
 * Gets the internal id from the request
 * @param client - the database client to use
 * @param request - the request to extract from
 * @returns The users internal id
 */
export async function getUserId(
  client: DbClient,
  request: Request,
): Promise<ObjectId | undefined> {
  const auth0Id = userIdFromReq(request);

  const coll = await client.userMap();
  return coll.find({ auth0Id }).then((res) => {
    return res[0]?.internalId;
  });
}

/**
 * Maps the current user to a given internal id
 * @param client - the database client to use
 * @param request - The request given to the endpoint
 * @param internalId - The internal id to map to the current user
 */
export async function mapUser(
  client: DbClient,
  request: Request,
  internalId: ObjectId,
): Promise<void> {
  const auth0Id = userIdFromReq(request);

  const coll = await client.userMap();
  await coll.insert({ auth0Id, internalId });
}

/**
 * Makes it so an attacker cannot use the stupid method of calculating a
 * password by looking at the time it takes for a string to be check against
 * the other
 *
 * This instead has a roughly constant time output for a given string length
 *
 * @param a - A string to check is equal to b
 * @param b - A string to check is equal to a
 *
 * @returns true if the strings are equal
 */
export function safeEqual(a: string, b: string): boolean {
  const len = a.length;

  let res = a.length === b.length;
  for (let i = 0; i < len; i++) {
    res = res && a[i] === b[i];
  }

  return res;
}

/**
 * Store the user id inside the given request so it can be passed to the endpoints
 * @param request - The request to set user id to
 * @param verifier - The result from the request to Auth0
 * @returns the updated request
 */
export function setUserId(
  request: Request,
  verifier: VerifyJwtResult,
): Request {
  request.auth0Id = verifier.payload.sub;
  if (!request.auth0Id) throw new UnauthorizedError("Could not find auth0 id");
  return request;
}

function userIdFromReq(request: Request): string {
  if (!request.auth0Id) throw new UnauthorizedError("Could not find auth0 id");

  return request.auth0Id;
}

// Taken from https://javascript.info/task/shuffle
export function shuffle(array: unknown[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i

    [array[i], array[j]] = [array[j], array[i]];
  }
}
