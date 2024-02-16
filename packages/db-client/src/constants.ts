export const USER_COLLECTION_NAME = "users";
export const USER_MAP_COLLECTION_NAME = "user_map";
export const LEAGUE_COLLECTION_NAME = "leagues";
export const MATCH_COLLECTION_NAME = "matches";

/**
 * @returns the name of the DB set via the environmental variables
 */
export function getDbName(): string {
  return getEnvWithCrash("DB_NAME");
}

/**
 * @returns the database URL set via the environmental variables
 */
export function getUrl(): string {
  return getEnvWithCrash("DB_CONN_STRING");
}

/**
 * Makes sure that the environmental variable is set, if it isn't it throws an
 * error
 *
 * @returns the value of the environmental variable
 */
function getEnvWithCrash(name: string): string {
  const env = process.env[name];
  if (env) {
    return env;
  }
  throw Error(`Expected ${name} to be set`);
}
