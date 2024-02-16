import { expect, test } from "@jest/globals";
import { ObjectId } from "../src/utils.js";

test("Object ID from JSON", () => {
  const tests: [unknown, unknown][] = [
    ["hi", "hi"],
    [2, 2],
    [null, null],
    [
      ["hi", 1, null],
      ["hi", 1, null],
    ],
    [
      { some: "hi", num: 2 },
      { some: "hi", num: 2 },
    ],
    [{ mongoDbId: "12345" }, new ObjectId("12345")],
    [{ mongoDbId: 2 }, { mongoDbId: 2 }],
    [
      { mongoDbId: "hello", num: 12 },
      { mongoDbId: "hello", num: 12 },
    ],
    [{ id: { mongoDbId: "12345" } }, { id: new ObjectId("12345") }],
    [
      { ids: [{ mongoDbId: "12345" }, { mongoDbId: "2345" }] },
      { ids: [new ObjectId("12345"), new ObjectId("2345")] },
    ],
    [
      {
        name: "hi",
        obj: { ids: [{ mongoDbId: "12345" }, { mongoDbId: "2345" }] },
      },
      {
        name: "hi",
        obj: { ids: [new ObjectId("12345"), new ObjectId("2345")] },
      },
    ],
  ];

  tests.forEach(([input, output]) => {
    expect(ObjectId.fromObj(input)).toStrictEqual(output);
    expect(ObjectId.fromJSON(JSON.stringify(input))).toStrictEqual(output);
  });
});
