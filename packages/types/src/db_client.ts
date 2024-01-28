import type { Document, Filter, Sort } from "mongodb";

export interface QueryOptions {
  query?: Filter<Document>;
  sort?: Sort;
  pageStart?: number; // Defaults to 0
  pageSize?: number; // Defaults to 20
}
