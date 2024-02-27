declare global {
  /**
   * The URI of the test MongoDB server.
   */
  var __MONGO_URI__: string;

  /**
   * The name of the database you should connect to.
   */
  var __MONGO_DB_NAME__: string;
}

export {};
