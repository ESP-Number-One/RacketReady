import { expect, test } from "@jest/globals";
import { censorUser } from "../src/user.js";
import { ObjectId, Sport } from "../src/utils.js";

test("public league", () => {
  expect(
    censorUser({
      _id: new ObjectId("yoo"),
      name: "Test bot",
      description: "Tester9000",
      profilePicture: "AAAAAAAA",
      email: "test@test.ts",
      sports: [
        { sport: Sport.Tennis, ability: "beginner" },
        { sport: Sport.Squash, ability: "expert" },
      ],
      leagues: [new ObjectId("something")],
      availability: [
        {
          timeStart: new Date().toLocaleString(),
          timeEnd: new Date().toLocaleString(),
        },
      ],
    }),
  ).toStrictEqual({
    _id: new ObjectId("yoo"),
    name: "Test bot",
    description: "Tester9000",
    sports: [
      { sport: Sport.Tennis, ability: "beginner" },
      { sport: Sport.Squash, ability: "expert" },
    ],
  });
});
