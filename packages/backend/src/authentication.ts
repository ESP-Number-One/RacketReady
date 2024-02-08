import type * as express from "express";
import { jwtVerifier, requiredScopes } from "access-token-jwt";
import * as config from "@esp-group-one/config";
import { getToken } from "oauth2-bearer";
import { setUserId } from "./utils.js";

// import pkg from "access-token-jwt";
// const { jwtVerifier } = pkg;

export function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[],
): Promise<void> {
  if (securityName === "auth0") {
    // Inspired from https://github.com/auth0/node-oauth2-jwt-bearer/blob/main/packages/express-oauth2-jwt-bearer/src/index.ts
    const jwt = getToken(
      request.headers,
      request.query,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- not our issue
      request.body,
      Boolean(request.is("urlencoded")),
    );

    const verifyJwt = jwtVerifier({
      audience: config.auth.apiIdentifier,
      issuerBaseURL: `https://${config.auth.domain}/`,
    });

    let resPromise = verifyJwt(jwt);

    if (scopes) {
      const checker = requiredScopes(scopes);
      resPromise = resPromise.then((res) => {
        checker(res.payload);
        return res;
      });
    }

    return resPromise.then((res) => {
      setUserId(request, res);
    });
  }

  return new Promise((_, reject) => {
    reject(new Error("Unknown authentication"));
  });
}
