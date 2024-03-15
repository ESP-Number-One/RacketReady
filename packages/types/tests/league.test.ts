import { describe, expect, test } from "@jest/globals";
import { censorLeague } from "../src/league.js";
import { ObjectId, Sport } from "../src/utils.js";
import { IDS, getLeague } from "./helpers/utils.js";
import { AbilityLevel } from "../src/user.js";

describe("Censor league", () => {
  test("public league", () => {
    expect(censorLeague(getLeague({ private: false }))).toStrictEqual({
      _id: new ObjectId(IDS[0]),
      name: "My custom League",
      sport: Sport.Squash,
      round: 0,
      private: false,
      picture: null,
    });
  });

  test("private league", () => {
    expect(censorLeague(getLeague({ private: true }))).toStrictEqual({
      _id: new ObjectId(IDS[0]),
      name: "My custom League",
      sport: Sport.Squash,
      round: 0,
      private: true,
      picture: null,
    });
  });
});
