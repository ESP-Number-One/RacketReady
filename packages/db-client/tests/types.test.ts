import { type Document, type Filter, ObjectId } from "mongodb";
import {
  ObjectId as FakeObjectId,
  type MongoDBItem,
  tests,
} from "@esp-group-one/types";
import { describe, expect, test } from "@jest/globals";
import { toInternal, toMongo } from "../src/types.js";

const { IDS } = tests;

describe("Convert to MongoDB", () => {
  test("Single type", () => {
    expect(toMongo(new FakeObjectId(IDS[0]))).toStrictEqual(
      new ObjectId(IDS[0]),
    );
    expect(toMongo(10)).toBe(10);
    expect(toMongo("hello")).toBe("hello");
  });

  test("Arrays", () => {
    expect(
      toMongo([new FakeObjectId(IDS[0]), new FakeObjectId(IDS[1])]),
    ).toStrictEqual([new ObjectId(IDS[0]), new ObjectId(IDS[1])]);
    expect(toMongo([10, 12, 13])).toStrictEqual([10, 12, 13]);
    expect(toMongo(["hello", "yo"])).toStrictEqual(["hello", "yo"]);
    expect(toMongo(["hello", 10, new FakeObjectId(IDS[0])])).toStrictEqual([
      "hello",
      10,
      new ObjectId(IDS[0]),
    ]);
  });

  test("Objects", () => {
    expect(
      toMongo({ _id: new FakeObjectId(IDS[0]), ref: new FakeObjectId(IDS[1]) }),
    ).toStrictEqual({
      _id: new ObjectId(IDS[0]),
      ref: new ObjectId(IDS[1]),
    });

    expect(toMongo({ ten: 10 })).toStrictEqual({ ten: 10 });
    expect(toMongo({ hello: "hello" })).toStrictEqual({ hello: "hello" });
    expect(
      toMongo({ name: "hello", score: 10, player: new FakeObjectId(IDS[0]) }),
    ).toStrictEqual({ name: "hello", score: 10, player: new ObjectId(IDS[0]) });
  });

  test("Queries", () => {
    interface Obj extends MongoDBItem {
      name: string;
      ids: FakeObjectId[];
    }

    const queries: [Filter<Obj>, Filter<Document>][] = [
      [{ _id: new FakeObjectId(IDS[0]) }, { _id: new ObjectId(IDS[0]) }],
      [
        { $or: [{ _id: new FakeObjectId(IDS[0]) }, { name: "Hello" }] },
        { $or: [{ _id: new ObjectId(IDS[0]) }, { name: "Hello" }] },
      ],
      [
        { $and: [{ _id: new FakeObjectId(IDS[0]) }, { name: "Hello" }] },
        { $and: [{ _id: new ObjectId(IDS[0]) }, { name: "Hello" }] },
      ],
      [
        {
          $and: [
            {
              $or: [
                {
                  _id: {
                    $in: [new FakeObjectId(IDS[0]), new FakeObjectId(IDS[1])],
                  },
                },
                { ids: new FakeObjectId(IDS[1]) },
              ],
            },
            { name: "Hello" },
          ],
        },
        {
          $and: [
            {
              $or: [
                {
                  _id: {
                    $in: [new ObjectId(IDS[0]), new ObjectId(IDS[1])],
                  },
                },
                { ids: new ObjectId(IDS[1]) },
              ],
            },
            { name: "Hello" },
          ],
        },
      ],
    ];

    queries.forEach(([inp, expected]) => {
      expect(toMongo(inp)).toStrictEqual(expected);
    });
  });
});

describe("Convert to Internal", () => {
  test("Single type", () => {
    expect(toInternal(new ObjectId(IDS[0]))).toStrictEqual(
      new FakeObjectId(IDS[0]),
    );
    expect(toInternal(10)).toBe(10);
    expect(toInternal("hello")).toBe("hello");
  });

  test("Arrays", () => {
    expect(
      toInternal([new ObjectId(IDS[0]), new ObjectId(IDS[1])]),
    ).toStrictEqual([new FakeObjectId(IDS[0]), new FakeObjectId(IDS[1])]);
    expect(toInternal([10, 12, 13])).toStrictEqual([10, 12, 13]);
    expect(toInternal(["hello", "yo"])).toStrictEqual(["hello", "yo"]);
    expect(toInternal(["hello", 10, new ObjectId(IDS[0])])).toStrictEqual([
      "hello",
      10,
      new FakeObjectId(IDS[0]),
    ]);
  });

  test("Objects", () => {
    expect(
      toInternal({ _id: new ObjectId(IDS[0]), ref: new ObjectId(IDS[1]) }),
    ).toStrictEqual({
      _id: new FakeObjectId(IDS[0]),
      ref: new FakeObjectId(IDS[1]),
    });

    expect(toInternal({ ten: 10 })).toStrictEqual({ ten: 10 });
    expect(toInternal({ hello: "hello" })).toStrictEqual({ hello: "hello" });
    expect(
      toInternal({ name: "hello", score: 10, player: new ObjectId(IDS[0]) }),
    ).toStrictEqual({
      name: "hello",
      score: 10,
      player: new FakeObjectId(IDS[0]),
    });
  });

  test("Queries", () => {
    interface Obj extends MongoDBItem {
      name: string;
      ids: FakeObjectId[];
    }

    const queries: [Filter<Document>, Filter<Obj>][] = [
      [{ _id: new ObjectId(IDS[0]) }, { _id: new FakeObjectId(IDS[0]) }],
      [
        { $or: [{ _id: new ObjectId(IDS[0]) }, { name: "Hello" }] },
        { $or: [{ _id: new FakeObjectId(IDS[0]) }, { name: "Hello" }] },
      ],
      [
        { $and: [{ _id: new ObjectId(IDS[0]) }, { name: "Hello" }] },
        { $and: [{ _id: new FakeObjectId(IDS[0]) }, { name: "Hello" }] },
      ],
      [
        {
          $and: [
            {
              $or: [
                {
                  _id: {
                    $in: [new ObjectId(IDS[0]), new ObjectId(IDS[1])],
                  },
                },
                { ids: new ObjectId(IDS[1]) },
              ],
            },
            { name: "Hello" },
          ],
        },
        {
          $and: [
            {
              $or: [
                {
                  _id: {
                    $in: [new FakeObjectId(IDS[0]), new FakeObjectId(IDS[1])],
                  },
                },
                { ids: new FakeObjectId(IDS[1]) },
              ],
            },
            { name: "Hello" },
          ],
        },
      ],
    ];

    queries.forEach(([inp, expected]) => {
      expect(toInternal(inp)).toStrictEqual(expected);
      // We don't need to check JSON output here because we will know that we
      // will never covert the output from MongoDB to JSON
    });
  });
});
