import { expect, test } from "@jest/globals";
import { censorUser } from "../src/user.js";
import { ObjectId, Sport } from "../src/utils.js";
import { getUser } from "./utils.js";

test("public league", () => {
  const user = getUser({});
  expect(censorUser(user)).toStrictEqual({
    _id: new ObjectId("yoo"),
    name: "Test bot",
    description: "Tester9000",
    sports: [
      { sport: Sport.Tennis, ability: "beginner" },
      { sport: Sport.Squash, ability: "expert" },
    ],
  });
});
