import type * as express from "express";
import { jwtVerifier } from "access-token-jwt";
import * as config from "@esp-group-one/config";
import { getToken } from "oauth2-bearer";
import { setUserId } from "./lib/utils.js";

export function expressAuthentication(
  request: express.Request,
  securityName: string,
  _?: string[],
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Inspired from https://github.com/auth0/node-oauth2-jwt-bearer/blob/main/packages/express-oauth2-jwt-bearer/src/index.ts
    if (securityName === "auth0") {
      try {
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

        const resPromise = verifyJwt(jwt);

        resPromise
          .then((res) => {
            setUserId(request, res);
          })
          .then(() => {
            resolve(void 0);
          })
          .catch((e: Error) => {
            console.warn(`Could not verify "${jwt}": ${e.message}`);
            reject(e);
          });

        return;
      } catch (e) {
        const err = e as Error;
        console.warn(`Could not verify request: ${err.name}: ${err.message}`);
        reject(e);
      }
    }

    reject(new Error("Unknown authentication"));
  });
}
