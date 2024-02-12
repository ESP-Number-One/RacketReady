import { DbClient } from "@esp-group-one/db-client";
import type { VerifyJwtResult } from "access-token-jwt";
import type { Request } from "express";
import { ObjectId } from "mongodb";

export async function getUserId(
  request: Request,
): Promise<ObjectId | undefined> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access -- we need to pass information somehow
  const userId = (request as any).userId as string;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access -- we need to pass information somehow
  const userId = (request as any).userId as string;

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
