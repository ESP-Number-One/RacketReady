export const USER_COLLECTION_NAME = "users";
export const LEAGUE_COLLECTION_NAME = "leagues";
export const MATCH_COLLECTION_NAME = "matches";

export function getDbName(): string {
  return getEnvWithCrash("DB_NAME");
}

export function getUrl(): string {
  return getEnvWithCrash("DB_CONN_STRING");
}

function getEnvWithCrash(name: string): string {
  const env = process.env[name];
  if (env) {
    return env;
  }
  throw Error(`Expected ${name} to be set`);
}
