import type { DbClient } from "@esp-group-one/db-client";
import type { ObjectId } from "@esp-group-one/types";
import { UnauthorizedError, type VerifyJwtResult } from "access-token-jwt";
import type { Request } from "express";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- we need to override request
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
