export interface PageOptions<T> {
  query?: T;
  sort?: SortQuery<T>;

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

export type QueryOptions<T> = PageOptions<Query<T>>;

// These basically are replacements for MongoDB types (as they don't work
// correctly with TSOA)
//
// Sadly we can't use recursive data types and so this is configured as such

/**
 * Controls whether to sort the assigned attribute in assending or descending
 * order
 */
export enum Sort {
  ASC = 1,
  DESC = -1,
}

/**
 * Allows to define which elements we want to sort in the given order
 */
export type SortQuery<T> = {
  [P in keyof T]?: Sort;
};

/**
 * Allows us to check if value is in array
 */
interface InQuery<T> {
  $in: T[];
}

/**
 * Allows us to check if value is in array
 */
interface AllQuery<T> {
  $all: T[];
}

/**
 * This is the type for a single item in an object
 */
type ItemQuery<T> = T extends (infer R)[]
  ? InQuery<R> | AllQuery<R> | T | R
  : InQuery<T> | T;

type QueryPartial<T> = {
  [P in keyof T]?: ItemQuery<T[P]> | undefined;
};

export type Query<T> = QueryPartial<T>;
