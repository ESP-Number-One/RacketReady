import { expect, test } from "@jest/globals";
import { ObjectId } from "../src/utils.js";
import { IDS } from "./utils.js";

describe("Object ID", () => {
  test("from JSON", () => {
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
      [{ mongoDbId: IDS[0] }, new ObjectId(IDS[0])],
      [{ mongoDbId: 2 }, { mongoDbId: 2 }],
      [
        { mongoDbId: "hello", num: 12 },
        { mongoDbId: "hello", num: 12 },
      ],
      [{ id: { mongoDbId: IDS[0] } }, { id: new ObjectId(IDS[0]) }],
      [
        { ids: [{ mongoDbId: IDS[0] }, { mongoDbId: IDS[1] }] },
        { ids: [new ObjectId(IDS[0]), new ObjectId(IDS[1])] },
      ],
      [
        {
          name: "hi",
          obj: { ids: [{ mongoDbId: IDS[0] }, { mongoDbId: IDS[1] }] },
        },
        {
          name: "hi",
          obj: { ids: [new ObjectId(IDS[0]), new ObjectId(IDS[1])] },
        },
      ],
    ];

    tests.forEach(([input, output]) => {
      expect(ObjectId.fromObj(input)).toStrictEqual(output);
      expect(ObjectId.fromJSON(JSON.stringify(input))).toStrictEqual(output);
    });
  });

  test("Invalid id throws", () => {
    expect(() => new ObjectId("a")).toThrow();
    expect(() => new ObjectId("ssssssssssssssssssssssss")).toThrow();
  });

  test("to string", () => {
    expect(new ObjectId(IDS[0]).toString()).toBe(IDS[0]);
  });
});
