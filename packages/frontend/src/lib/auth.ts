import { useAuth0 } from "@auth0/auth0-react";
import { APIClient } from "@esp-group-one/api-client";

export async function getAPIClient(): Promise<APIClient> {
  const { getAccessTokenSilently } = useAuth0();

  // TODO: Cache this to cookies or something?
  const apiToken = await getAccessTokenSilently();

  return new APIClient(apiToken);
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
