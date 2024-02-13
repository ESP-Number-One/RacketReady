export interface QueryOptions {
  // Annoyingly tsoa cannot compile mongoDB types and so this will have to do
  query?: unknown;
  sort?: unknown;
  /**
   * Should be the number of attributes before the first one to assign, not the
   * page number
   *
   * @defaultValue 0
   */
  pageStart?: number;
  /**
   * How many entities to return
   *
   * @defaultValue 20
   */
  pageSize?: number;
}
