import { describe, expect, test } from "@jest/globals";
import { censorLeague } from "../src/league.js";
import { ObjectId, Sport } from "../src/utils.js";

describe("Censor league", () => {
  test("public league", () => {
    expect(
      censorLeague({
        _id: new ObjectId("test"),
        name: "My custom League",
        sport: Sport.Squash,
        ownerIds: [new ObjectId("something")],
        private: false,
      }),
    ).toStrictEqual({
      _id: new ObjectId("test"),
      name: "My custom League",
      sport: Sport.Squash,
      private: false,
    });
  });

  test("private league", () => {
    expect(
      censorLeague({
        _id: new ObjectId("test"),
        name: "My custom League",
        sport: Sport.Squash,
        ownerIds: [new ObjectId("something")],
        private: true,
        inviteCode: "yoooo",
      }),
    ).toStrictEqual({
      _id: new ObjectId("test"),
      name: "My custom League",
      sport: Sport.Squash,
      private: true,
    });
  });
});
