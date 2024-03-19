import { expect, test } from "@jest/globals";
import { ObjectId, hasId, makeImgSrc } from "../src/utils.js";
import { Default } from "../src/defaults.js";
import { IDS, OIDS } from "./helpers/utils.js";

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

  test("equals", () => {
    expect(new ObjectId(IDS[0]).equals(new ObjectId(IDS[0]))).toBe(true);
    expect(new ObjectId(IDS[0]).equals(new ObjectId(IDS[1]))).toBe(false);
  });

  test("hasId", () => {
    const ids = [OIDS[0], OIDS[1]];
    expect(hasId(ids, OIDS[0])).toBe(true);
    expect(hasId(ids, OIDS[1])).toBe(true);
    expect(hasId(ids, OIDS[2])).toBe(false);
    expect(hasId([], OIDS[0])).toBe(false);
  });
});

describe("makeWebP", () => {
  test("prepend", () => {
    expect(makeImgSrc(`12`)).toBe("data:image/webp;base64,12");
  });

  test("idempotency", () => {
    expect(makeImgSrc("data:image/webp;base64,12")).toBe(
      "data:image/webp;base64,12",
    );
    expect(makeImgSrc(Default.PICTURE)).toBe(Default.PICTURE);
  });

  test("undefined", () => {
    expect(makeImgSrc(undefined)).toBe(Default.PICTURE);
    expect(makeImgSrc(null)).toBe(Default.PICTURE);
  });
});
