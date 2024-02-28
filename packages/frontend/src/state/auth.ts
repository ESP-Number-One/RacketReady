import type { APIClient } from "@esp-group-one/api-client";
import { type MutableRefObject, createContext } from "react";
import { isNewUser } from "../lib/auth";

/* Global-ish state for React.  */
export const Auth = createContext(undefined as unknown as APIClient);

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
      // TODO: Swap to redirect to signup form
      client
        .user()
        .create({
          description: "I am test bot 9000",
          email: "test@bath.ac.uk",
          name: "Test Bot",
          profilePicture: "",
        })
        .catch(console.error);
    }
    setResult({ type: "ok", ok: { authenticated: true, client } });
    hasSetAPI.current = true;
  };
}

/* import { useAuth0 } from "@auth0/auth0-react";
import type { APIClient } from "@esp-group-one/api-client";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, type ReactNode, useEffect } from "react";
import { isNewUser, useAPIClient } from "../lib/auth.js";
import { LoginButton } from "./auth.js";

interface PageParamsBase {
  currPage: string; // to be used for nav page
  disableAuth?: boolean;
  setAPI: (client: APIClient) => void;
  children: ReactNode;
}

interface PageParams extends PageParamsBase {
  heading?: ReactNode;
}

interface WithTitleParams extends PageParamsBase {
  heading: string | ReactNode;
  backUrl?: string;
  extra?: ReactNode;
}

export function Page({ children, disableAuth, heading, setAPI }: PageParams) {
  const { isAuthenticated } = useAuth0();
  const hasSetAPI = useRef<boolean>(false);

  // The idea here is that we only want to call the API once.
  const api = useAPIClient(isAuthenticated);

  // This seems to have a weird property of only running the function inside
  // one at a time. Which means we don't have to deal with edge cases
  useEffect(() => {
    api
      .then(async (client) => {
        // This makes sure we haven't set the API before, as from testing Page
        // is re-rendered twice in the same second.
        if (!client || disableAuth || hasSetAPI.current) return;
        hasSetAPI.current = true;
        setAPI(client);
        if (await isNewUser(client)) {
          // TODO: Swap to redirect to signup form
          client
            .user()
            .create({
              description: "I am test bot 9000",
              email: "test@bath.ac.uk",
              name: "Test Bot",
              profilePicture: "",
            })
            .catch(console.error);
        }
      })
      .catch(console.log);
  }, [api, disableAuth, isAuthenticated, setAPI]);

  return (
    <div className="w-full min-h-screen">
      {disableAuth || isAuthenticated ? (
        <>
          {heading}
          <div className="px-4">{children}</div>
        </>
      ) : (
        <div className="flex min-h-screen px-3 items-center place-content-center">
          <LoginButton />
        </div>
      )}
    </div>
  );
}

export function PageWithTitle({
  backUrl,
  children,
  currPage,
  disableAuth,
  extra,
  heading,
  setAPI,
}: WithTitleParams) {
  const parts: ReactNode[] = [];

  if (backUrl) {
    // don't ask about the icon prop seems to be a bug in fontawesome
    parts.push(
      <div className="flex-initial w-8 mt-4" key="page-back">
        <a href={backUrl}>
          <FontAwesomeIcon icon={faChevronLeft} size="2x" />
        </a>
      </div>,
    );
  }

  const title =
    typeof heading === "string" ? (
      <h1
        className="font-title font-semibold text-4xl text-p-grey-900"
        key="page-title"
      >
        {heading}
      </h1>
    ) : (
      heading
    );
  parts.push(
    <div className="flex-auto" key="page-title">
      {title}
    </div>,
  );

  if (extra)
    parts.push(
      <div className="flex-initial w-8" key="page-extra">
        {extra}
      </div>,
    );

  const headingNode = <div className="flex px-3 py-2">{parts}</div>;

  return (
    <Page
      currPage={currPage}
      disableAuth={disableAuth}
      heading={headingNode}
      setAPI={setAPI}
    >
      {children}
    </Page>
  );
}
*/
