import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import { app } from "../src/app.js";

describe("Catches 404s", () => {
  test("GET", async () => {
    const res = await request(app).get("/not_a_page");
    expect(res.statusCode).toBe(404);
  });

  test("POST", async () => {
    const res = await request(app).post("/not_a_page");
    expect(res.statusCode).toBe(404);
  });
});

describe("Swagger does not error out", () => {
  test("is 200", async () => {
    const res = await request(app).get("/docs");
    expect(res.statusCode).toBe(301);
  });
});
