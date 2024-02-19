import { DbClient } from "@esp-group-one/db-client";
import type { VerifyJwtResult } from "access-token-jwt";
import type { Request } from "express";
import type { ObjectId } from "mongodb";

export async function getUserId(
  request: Request,
): Promise<ObjectId | undefined> {
  const userId = userIdFromReq(request);

  const client = new DbClient();
  const coll = await client.userMap();
  return coll.find({ userId }).then((res) => {
    return res[0]?.internalId;
  });
}

export async function mapUser(
  request: Request,
  internalId: ObjectId,
): Promise<void> {
  const userId = userIdFromReq(request);

  const client = new DbClient();
  const coll = await client.userMap();
  await coll.insert({ userId, internalId });
}

export function setUserId(
  request: Request,
  verifier: VerifyJwtResult,
): Request {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access -- we need to pass information somehow
  (request as any).userId = verifier.payload.sub;
  return request;
}

function userIdFromReq(request: Request): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access -- we need to pass information somehow
  return (request as any).userId as string;
}