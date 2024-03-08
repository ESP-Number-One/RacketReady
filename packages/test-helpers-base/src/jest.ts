import { expect } from "@jest/globals";
import type { MongoDBItem } from "@esp-group-one/types";

export function idCmp<T extends MongoDBItem>(a: T, b: T): number {
  return a._id.mongoDbId.localeCompare(b._id.mongoDbId);
}

/**
 * Compares an array without taking positions into account
 */
export function compareBag<T>(
  got: T[],
  expected: T[],
  cmp?: (a: T, b: T) => number,
) {
  expect(got.sort(cmp)).toStrictEqual(expected.sort(cmp));
}
