import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Route, Routes, type To, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Page } from "./components/page/index.js";
import { Header } from "./components/page/header.js";
import { TestPage } from "./pages/test.js";
import { AnotherTestPage } from "./pages/another_test.js";
import { Auth, type AuthResult, handleApi } from "./state/auth.js";
import { LoginButton } from "./components/auth.js";
import { useAPIClient } from "./lib/auth.js";

export function App() {
  const [result, setResult] = useState({ type: "loading" } as AuthResult);
  const hasSetApi = useRef(false);
  const { isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const viewNavigate = (newRoute: To) => {
    // Navigate to the new route
    if (
      !(document as unknown as { startViewTransition?: unknown })
        .startViewTransition
    ) {
      navigate(newRoute);
    } else {
      return document.startViewTransition(() => {
        navigate(newRoute);
      });
    }
  };

  const api = useAPIClient(isAuthenticated);

  useEffect(() => {
    console.log("Ran!");
    console.log({ isAuthenticated, hasSetApi });
    api.then(handleApi(hasSetApi, setResult)).catch((err: string) => {
      setResult({ type: "err", err: err.toString() });
    });
  }, [isAuthenticated]);

  if (result.type === "loading" || !hasSetApi.current) {
    return <></>;
  }

  if (result.type === "err") {
    return <p>{result.err}</p>;
  }

  const { ok } = result;

  console.log({ ok });

  return ok.authenticated ? (
    <Auth.Provider value={ok.client}>
      <Page>
        <Page.Header>
          <Header.Back />
          Whatever goes in here, stays in here.
          <Header.Right>
            <FontAwesomeIcon icon={faPlus} />
          </Header.Right>
        </Page.Header>
        <Page.Body style={{ viewTransitionName: "body-content" }}>
          <Routes>
            <Route index element={<TestPage />} />
            <Route path="/another" element={<AnotherTestPage />} />
          </Routes>
        </Page.Body>
        <Page.Footer>
          <button
            onClick={() => {
              viewNavigate("/");
            }}
          >
            First Test page
          </button>
          <button
            onClick={() => {
              viewNavigate("/another");
            }}
          >
            Another page.
          </button>
        </Page.Footer>
      </Page>
    </Auth.Provider>
  ) : (
    <div className="flex min-h-screen px-3 items-center place-content-center">
      <LoginButton />
    </div>
  );
}
