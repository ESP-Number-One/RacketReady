/* eslint-disable no-var -- setting global variables */
// Have a global DB so we can easily close it from tests

import { DbClient } from "@esp-group-one/db-client";

declare var db: DbClient | undefined;

// eslint-disable-next-line no-redeclare -- for some reason its doesn't work otherwise
var db: DbClient | undefined;

export function getDb(): DbClient {
  if (!db) db = new DbClient();
  return db;
}

export async function closeDb(): Promise<void> {
  if (db) {
    await db.close().catch(console.error);
    db = undefined;
  }
}
