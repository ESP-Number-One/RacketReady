import { DbClient } from "@esp-group-one/db-client";
import type { ObjectId } from "@esp-group-one/types";
import type { VerifyJwtResult } from "access-token-jwt";
import type { Request } from "express";

export async function getUserId(
  request: Request,
): Promise<ObjectId | undefined> {
  const auth0Id = userIdFromReq(request);

  const client = new DbClient();
  const coll = await client.userMap();
  return coll.find({ auth0Id }).then((res) => {
    return res[0]?.internalId;
  });
}

export async function mapUser(
  request: Request,
  internalId: ObjectId,
): Promise<void> {
  const auth0Id = userIdFromReq(request);

  const client = new DbClient();
  const coll = await client.userMap();
  await coll.insert({ auth0Id, internalId });
}

export function setUserId(
  request: Request,
  verifier: VerifyJwtResult,
): Request {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access -- we need to pass information somehow
  (request as any).auth0Id = verifier.payload.sub;
  return request;
}

function userIdFromReq(request: Request): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access -- we need to pass information somehow
  return (request as any).auth0Id as string;
}
