declare global {
  /**
   * The URI of the test MongoDB server.
   */
  let __MONGO_URI__: string;

  /**
   * The name of the database you should connect to.
   */
  let __MONGO_DB_NAME__: string;
}

export function setup() {
  process.env.DB_CONN_STRING = getMongoURL();
  process.env.DB_NAME = getMongoDBName();
}

export function getMongoURL(): string {
  // eslint-disable-next-line no-undef -- it is
  return __MONGO_URI__;
}

export function getMongoDBName(): string {
  // eslint-disable-next-line no-undef -- it is
  return __MONGO_DB_NAME__;
}
