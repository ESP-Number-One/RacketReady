import * as express from "express";
import { type VerifyJwtResult, jwtVerifier } from "access-token-jwt";
import * as config from "@esp-group-one/config";
import { getToken } from "oauth2-bearer";

// import pkg from "access-token-jwt";
// const { jwtVerifier } = pkg;

export function expressAuthentication(
  request: express.Request,
  securityName: string,
  _?: string[],
): Promise<VerifyJwtResult> {
  if (securityName === "auth0") {
    // Inspired from https://github.com/auth0/node-oauth2-jwt-bearer/blob/main/packages/express-oauth2-jwt-bearer/src/index.ts
    const jwt = getToken(
      request.headers,
      request.query,
      request.body,
      !!request.is("urlencoded"),
    );

    const verifyJwt = jwtVerifier({
      audience: config.auth.apiIdentifier,
      issuerBaseURL: `https://${config.auth.domain}/`,
    });

    console.log(`Token: ${jwt}`);

    return verifyJwt(jwt);
  }

  return new Promise((_, reject) =>
    reject(new Error("Unknown authentication")),
  );
}
