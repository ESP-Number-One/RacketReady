import type { Collection, OptionalId } from "mongodb";
import type { MongoDBItem, SortQuery } from "@esp-group-one/types";
import { describe, expect, test } from "@jest/globals";
import { CollectionWrap } from "../src/collection.js";
import {
  getRawClient,
  getRawDb,
  insertMany,
  reset,
  setup,
} from "./lib/utils.js";

setup();

interface TestObj extends MongoDBItem {
  name: string;
  num: number;
}

const COLLECTION = "test";
let coll: CollectionWrap<TestObj>;
let mongoColl: Collection;

beforeEach(async () => {
  await reset(COLLECTION);
  const client = await getRawClient();
  mongoColl = getRawDb(client).collection(COLLECTION);
  coll = new CollectionWrap<TestObj>(mongoColl);
});

test("exists", async () => {
  await mongoColl.insertOne({ name: "Test Bot", num: 9000 });

  expect(await coll.exists({ name: "Test Bot" })).toBe(true);
  expect(await coll.exists({ num: 9000 })).toBe(true);
  expect(await coll.exists({ name: "hi" })).toBe(false);
  expect(await coll.exists({ name: "Test Bot", num: 700 })).toBe(false);
});

test("find", async () => {
  const data = await insertMany(mongoColl, [
    { name: "Test Bot", num: 9000 },
    { name: "Test Bot", num: 8000 },
    { name: "Botter", num: 2000 },
  ]);

  expect(await coll.find({ name: "Test Bot" })).toStrictEqual([
    data[0],
    data[1],
  ]);
  expect(await coll.find({ num: 9000 })).toStrictEqual([data[0]]);
  expect(await coll.find({ num: 2000 })).toStrictEqual([data[2]]);
  expect(await coll.find({ name: "hi" })).toStrictEqual([]);
  expect(await coll.find({ name: "Test Bot", num: 700 })).toStrictEqual([]);
});

test("get", async () => {
  const data: TestObj[] = await insertMany<TestObj>(mongoColl, [
    { name: "Test Bot", num: 9000 },
    { name: "Test Bot", num: 8000 },
    { name: "Botter", num: 2000 },
  ]);

  const res = [];
  for (const e of data) {
    res.push(
      coll.get(e._id).then((r) => {
        expect(r).toStrictEqual(e);
      }),
    );
  }

  await Promise.all(res);
});

test("insert", async () => {
  const data: OptionalId<TestObj>[] = [
    { name: "Test Bot", num: 9000 },
    { name: "Test Bot", num: 8000 },
    { name: "Botter", num: 2000 },
  ];

  const res = await coll.insert(...data);

  const checks = [];
  for (let i = 0; i < checks.length; i++) {
    checks.push(
      coll.get(res[i]).then((r) => {
        expect(r).toStrictEqual({ ...data[i], _id: res[i] });
      }),
    );
  }
  await Promise.all(checks);
});

describe("page", () => {
  const noIdData: OptionalId<TestObj>[] = [...Array(40).keys()].map((i) => {
    return { name: `Test ${99 - i}`, num: i };
  });

  let data: TestObj[];
  beforeEach(async () => {
    data = await insertMany<TestObj>(mongoColl, noIdData);
  });

  [0, 1, -1].forEach((sortDir) => {
    [10, 20, 30, 40, 50].forEach((pageSize) => {
      test(`with page size ${pageSize} and direction ${sortDir}`, async () => {
        let start = sortDir < 0 ? data.length : 0;
        const checks = [];
        while (start < data.length) {
          const expected: TestObj[] = [];

          let sort: SortQuery<TestObj> | undefined;
          if (sortDir === -1) {
            sort = { name: 1 };

            for (let i = start; i >= start - pageSize && i >= 0; i--) {
              expected.push(data[start + i]);
            }
          } else {
            if (sortDir === 1) sort = { num: 1 };

            for (let i = 0; i < pageSize && start + i < data.length; i++) {
              expected.push(data[start + i]);
            }
          }

          checks.push(
            coll.page({ pageSize, pageStart: start, sort }).then((r) => {
              expect(r).toStrictEqual(expected);
            }),
          );

          if (sortDir < 0) {
            start -= pageSize;
          } else {
            start += pageSize;
          }
        }

        await Promise.all(checks);
      });
    });
  });
});
