import { useAuth0 } from "@auth0/auth0-react";
import { APIClient } from "@esp-group-one/api-client";
import { getAPIClient } from "../lib/auth.js";

/**
 * Work around due to the fact we need to wait until the user has logged in
 * before we can initialise the api client.
 *
 * Pages is designed to handle authentication behind the scenes but this means
 * we can just add this as a child
 */
export function APIClientInit({ setAPI }: { setAPI(client: APIClient): void }) {
  getAPIClient()
    .then((client) => setAPI(client))
    .catch((err) => console.error(err));
  return <></>;
}

export function LoginButton() {
  const { loginWithRedirect } = useAuth0();

  return <button onClick={() => loginWithRedirect()}>Log In</button>;
}

export function LogoutButton() {
  const { logout } = useAuth0();

  return (
    <button
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
    >
      Log Out
    </button>
  );
}
