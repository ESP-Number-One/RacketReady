import * as fs from "node:fs";
import type { VerifyJwtResult } from "access-token-jwt";
import { jwtVerifier } from "access-token-jwt";
import { ObjectId } from "@esp-group-one/types";
import { expect } from "@jest/globals";
import request from "supertest";
import type { App } from "supertest/types.js";
import { asFuncMock } from "@esp-group-one/test-helpers";
import type Test from "supertest/lib/test.js";

const mockedJWTVerifier = asFuncMock(jwtVerifier);

export function readStaticFile(filename: string): string {
  let file = `tests/static/${filename}`;
  if (!fs.existsSync(file)) {
    file = `packages/backend/${file}`;
  }

  const bitmap = fs.readFileSync(file);
  return Buffer.from(bitmap).toString("base64");
}

export function expectAPIRes<T>(inp: T) {
  return expect(ObjectId.fromObj(inp) as T);
}

export function requestWithAuth(pkg: App, auth0Id = "github|123456") {
  if (auth0Id !== "") {
    mockedJWTVerifier.mockReturnValue((__: string) => {
      return Promise.resolve({
        payload: { sub: auth0Id },
      } as VerifyJwtResult);
    });
  } else {
    mockedJWTVerifier.mockReturnValue((__: string) => {
      return Promise.reject(new Error("Invalid user"));
    });
  }
  return new AuthWrapper(pkg);
}

export class AuthWrapper {
  app: App;

  constructor(app: App) {
    this.app = app;
  }

  get(url: string) {
    return this.setHeader(this.request().get(url));
  }

  post(url: string) {
    return this.setHeader(this.request().post(url));
  }

  private request() {
    return request(this.app);
  }

  private setHeader(t: Test) {
    return t.set("Authorization", "Bearer test_api_token");
  }
}
