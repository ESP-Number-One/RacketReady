import type { APIClient } from "@esp-group-one/api-client";
import { type MutableRefObject, createContext } from "react";
import { isNewUser } from "../lib/auth";

/* Global-ish state for React.  */
export const API = createContext(undefined as unknown as APIClient);

export type AuthResult =
  | { type: "loading" }
  | {
      type: "ok";
      ok: { authenticated: true; client: APIClient } | { authenticated: false };
    }
  | { type: "err"; err: string };

export function handleApi(
  hasSetAPI: MutableRefObject<boolean>,
  setResult: (client: AuthResult) => void,
  signup: () => void,
): (_: APIClient | undefined) => Promise<void> {
  return async (client: APIClient | undefined) => {
    // This makes sure we haven't set the API before, as from testing Page
    // is re-rendered twice in the same second.

    if (!client) {
      setResult({ type: "ok", ok: { authenticated: false } });
      hasSetAPI.current = true;
      return;
    }

    if (await isNewUser(client)) {
      signup();
    }

    setResult({ type: "ok", ok: { authenticated: true, client } });
    hasSetAPI.current = true;
  };
}
