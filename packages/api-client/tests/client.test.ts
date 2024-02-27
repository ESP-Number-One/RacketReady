import { expect, test } from "@jest/globals";
import { APIClient } from "../src/client.js";

test("league", () => {
  const api = new APIClient("some_access_token", "https://test.com");
  const leagues = api.league();
  expect(leagues.url).toBe("https://test.com/league");
});

test("match", () => {
  const api = new APIClient("some_access_token", "https://test.com");
  const matches = api.match();
  expect(matches.url).toBe("https://test.com/match");
});

test("user", () => {
  const api = new APIClient("some_access_token", "https://test.com");
  const users = api.user();
  expect(users.url).toBe("https://test.com/user");
});
