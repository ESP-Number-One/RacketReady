export interface QueryOptions {
  // Annoyingly tsoa cannot compile mongoDB types and so this will have to do
  query?: unknown;
  sort?: unknown;
  pageStart?: number; // Defaults to 0
  pageSize?: number; // Defaults to 20
}
