import { expect, test } from "@jest/globals";
import { newAPIError, newAPISuccess } from "../src/api.js";

test("newAPIError", () => {
  expect(newAPIError("Something")).toStrictEqual({
    success: false,
    error: "Something",
  });
});

test("newAPISuccess", () => {
  expect(newAPISuccess({ name: "Yo", num: 19 })).toStrictEqual({
    success: true,
    data: { name: "Yo", num: 19 },
  });
});
