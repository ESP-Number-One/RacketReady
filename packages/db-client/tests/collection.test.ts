import type { Collection, MongoClient, OptionalId } from "mongodb";
import type { MongoDBItem, SortQuery } from "@esp-group-one/types";
import { describe, expect, test } from "@jest/globals";
import { CollectionWrap } from "../src/collection.js";
import { toMongo } from "../src/types.js";
import { getRawClient, getRawDb, insertMany, setup } from "./helpers/utils.js";

interface TestObj extends MongoDBItem {
  name: string;
  num: number;
}

const COLLECTION = "test";
let coll: CollectionWrap<TestObj>;
let mongoClient: MongoClient;
let mongoColl: Collection;

beforeAll(async () => {
  setup();

  mongoClient = await getRawClient();
  mongoColl = getRawDb(mongoClient).collection(COLLECTION);
  coll = new CollectionWrap<TestObj>(mongoColl);
});

beforeEach(async () => {
  await mongoColl.deleteMany();
});

afterAll(async () => {
  await mongoClient.close();
});

test("edit", async () => {
  const data = await insertMany<TestObj>(mongoColl, [
    { name: "Test Bot", num: 9000 },
  ]);
  await expect(
    coll.edit(data[0]._id, { $set: { num: 8000 } }),
  ).resolves.not.toThrow();
  await expect(mongoColl.findOne({})).resolves.toStrictEqual({
    ...toMongo(data[0]),
    num: 8000,
  });
});

test("exists", async () => {
  await mongoColl.insertOne({ name: "Test Bot", num: 9000 });

  await expect(coll.exists({ name: "Test Bot" })).resolves.toBe(true);
  await expect(coll.exists({ num: 9000 })).resolves.toBe(true);
  await expect(coll.exists({ name: "hi" })).resolves.toBe(false);
  await expect(coll.exists({ name: "Test Bot", num: 700 })).resolves.toBe(
    false,
  );
});

test("find", async () => {
  const data = await insertMany(mongoColl, [
    { name: "Test Bot", num: 9000 },
    { name: "Test Bot", num: 8000 },
    { name: "Botter", num: 2000 },
  ]);

  await expect(coll.find({ name: "Test Bot" })).resolves.toStrictEqual([
    data[0],
    data[1],
  ]);
  await expect(coll.find({ num: 9000 })).resolves.toStrictEqual([data[0]]);
  await expect(coll.find({ num: 2000 })).resolves.toStrictEqual([data[2]]);
  await expect(coll.find({ name: "hi" })).resolves.toStrictEqual([]);
  await expect(
    coll.find({ name: "Test Bot", num: 700 }),
  ).resolves.toStrictEqual([]);
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

test("raw", () => {
  expect(coll.raw()).toStrictEqual(mongoColl);
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
    [0, 10, 20, 30, 40, 50].forEach((pageSize) => {
      test(`with page size ${pageSize} and direction ${sortDir}`, async () => {
        let start = sortDir < 0 ? data.length : 0;
        const checks = [];
        while (start < data.length) {
          const expected: TestObj[] = [];

          const resPageSize = pageSize === 0 ? 1 : pageSize;

          let sort: SortQuery<TestObj> | undefined;
          if (sortDir === -1) {
            sort = { name: 1 };

            for (let i = start; i >= start - resPageSize && i >= 0; i--) {
              expected.push(data[start + i]);
            }
          } else {
            if (sortDir === 1) sort = { num: 1 };

            for (let i = 0; i < resPageSize && start + i < data.length; i++) {
              expected.push(data[start + i]);
            }
          }

          checks.push(
            coll.page({ pageSize, pageStart: start, sort }).then((r) => {
              expect(r).toStrictEqual(expected);
            }),
          );

          if (sortDir < 0) {
            start -= resPageSize;
          } else {
            start += resPageSize;
          }
        }

        await Promise.all(checks);
      });
    });
  });
});
