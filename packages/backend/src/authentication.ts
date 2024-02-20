import type * as express from "express";
import { jwtVerifier, requiredScopes } from "access-token-jwt";
import * as config from "@esp-group-one/config";
import { getToken } from "oauth2-bearer";
import { setUserId } from "./lib/utils.js";

export function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[],
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

        let resPromise = verifyJwt(jwt);

        if (scopes) {
          const checker = requiredScopes(scopes);
          resPromise = resPromise.then((res) => {
            checker(res.payload);
            return res;
          });
        }

        resPromise
          .then((res) => {
            setUserId(request, res);
          })
          .then(() => {
            resolve(void true);
          })
          .catch((e) => {
            reject(e);
          });

        resolve(void 0);
      } catch (e) {
        reject(e);
      }
    }

    reject(new Error("Unknown authentication"));
  });
}
