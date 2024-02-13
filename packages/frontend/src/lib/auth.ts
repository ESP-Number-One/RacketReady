import { useAuth0 } from "@auth0/auth0-react";
import { APIClient } from "@esp-group-one/api-client";
import { useRef } from "react";

/**
 * React Handle which will get the API client only once
 *
 * Note this has to be recalled once the page has signed in.
 */
export async function useAPIClient(
  isAuthenticated: boolean,
): Promise<APIClient | undefined> {
  const client = useRef<APIClient | undefined>();
  const { getAccessTokenSilently } = useAuth0();

  if (!isAuthenticated) return;

  if (!client.current) {
    const apiToken = await getAccessTokenSilently();

    client.current = new APIClient(apiToken);
  }

  return client.current;
}

export async function isNewUser(client: APIClient): Promise<boolean> {
  return client
    .user()
    .me()
    .then(() => false)
    .catch((e) => {
      console.log(`Had error: ${e}`);
      return true;
    });
}
