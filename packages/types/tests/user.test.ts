import { expect, test } from "@jest/globals";
import type { Ratings } from "../src/user.js";
import {
  AbilityLevel,
  calculateAverageRating,
  censorUser,
} from "../src/user.js";
import { ObjectId, Sport } from "../src/utils.js";
import { getUser, IDS } from "./helpers/utils.js";

test("user", () => {
  const user = getUser({});
  expect(censorUser(user)).toStrictEqual({
    _id: new ObjectId(IDS[0]),
    name: "Test bot",
    description: "Tester9000",
    rating: { 1: 5, 2: 10, 3: 20, 4: 50, 5: 10 },
    sports: [
      { sport: Sport.Tennis, ability: AbilityLevel.Beginner },
      { sport: Sport.Squash, ability: AbilityLevel.Advanced },
    ],
    profilePicture: expect.any(String),
  });
});

describe("calculateAverageRating", () => {
  test("All same", () => {
    const rate: Ratings = { 1: 0, 2: 0, 3: 200, 4: 0, 5: 0 };
    expect(calculateAverageRating(rate)).toBe(3);
  });

  test("All one", () => {
    const rate: Ratings = { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 };
    expect(calculateAverageRating(rate)).toBe(3);
  });

  test("with zeros", () => {
    const rate: Ratings = { 1: 2, 2: 0, 3: 1, 4: 0, 5: 2 };
    expect(calculateAverageRating(rate)).toBe(3);
  });

  test("round output", () => {
    const rate: Ratings = { 1: 0, 2: 0, 3: 0, 4: 2, 5: 2 };
    expect(calculateAverageRating(rate)).toBe(5);
  });
});
