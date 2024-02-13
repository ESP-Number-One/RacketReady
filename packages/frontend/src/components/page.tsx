import { useAuth0 } from "@auth0/auth0-react";
import type { APIClient } from "@esp-group-one/api-client";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, type ReactNode, useEffect } from "react";
import { isNewUser, useAPIClient } from "../lib/auth.js";
import { LoginButton } from "./auth.js";

interface PageParamsBase {
  currPage: string; // to be used for nav page
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

export function Page({ children, heading, setAPI }: PageParams) {
  const { isAuthenticated } = useAuth0();
  const hasSetAPI = useRef<boolean>(false);

  // The idea here is that we only want to call the API once.
  const api = useAPIClient();

  // This seems to have a weird property of only running the function inside
  // one at a time. Which means we don't have to deal with edge cases
  useEffect(() => {
    api
      .then(async (client) => {
        // This makes sure we haven't set the API before, as from testing Page
        // is re-rendered twice in the same second.
        if (!hasSetAPI.current) {
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
              })
              .catch(console.error);
          }
        }
      })
      .catch(console.error);
  }, [api, isAuthenticated, setAPI]);

  return (
    <div className="w-full min-h-screen">
      {isAuthenticated ? (
        <>
          {heading}
          <div className="px-3">{children}</div>
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
  extra,
  heading,
  setAPI,
}: WithTitleParams) {
  const parts: ReactNode[] = [];

  if (backUrl) {
    // don't ask about the icon prop seems to be a bug in fontawesome
    parts.push(
      <div className="flex-initial w-8 mt-4">
        <a href={backUrl}>
          <FontAwesomeIcon icon={faChevronLeft} size="2x" />
        </a>
      </div>,
    );
  }

  const title =
    typeof heading === "string" ? (
      <h1 className="font-title text-4xl text-font-gray">{heading}</h1>
    ) : (
      heading
    );
  parts.push(<div className="flex-auto">{title}</div>);

  if (extra) parts.push(<div className="flex-initial w-8">{extra}</div>);

  const headingNode = <div className="flex px-2">{parts}</div>;

  return (
    <Page currPage={currPage} heading={headingNode} setAPI={setAPI}>
      {children}
    </Page>
  );
}
