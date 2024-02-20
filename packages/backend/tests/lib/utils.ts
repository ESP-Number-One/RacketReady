import request, { Test } from "supertest";
import TestAgent from "supertest/lib/agent.js";
import type { App } from "supertest/types.js";

export function requestWithAuth(pkg: App, valid: boolean = true) {
  return request(pkg).set("Authorization", "Bearer test_api_token");
}
