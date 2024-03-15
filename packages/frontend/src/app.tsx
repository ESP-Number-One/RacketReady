import { Route, Routes } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { AnotherTestPage } from "./pages/another_test.js";
import { API, type AuthResult, handleApi } from "./state/auth.js";
import { LoginButton } from "./components/auth.js";
import { useAPIClient } from "./lib/auth.js";
import { UpcomingMatch } from "./pages/upcoming.js";
import { ProfilePage } from "./pages/profile.js";
import { SetAvailability } from "./pages/me/availability.js";
import { NewMatchPage } from "./pages/match/new.js";
import { YourProfile } from "./pages/your_profile.js";

export function App() {
  const [result, setResult] = useState({ type: "loading" } as AuthResult);
  const hasSetApi = useRef(false);
  const { isAuthenticated } = useAuth0();
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
    <API.Provider value={ok.client}>
      <Routes>
        <Route index element={<UpcomingMatch />} />
        <Route path="/another" element={<AnotherTestPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/me" element={<YourProfile />} />
        <Route path="/me/availability" element={<SetAvailability />} />
        <Route path="/match/new" element={<NewMatchPage />} />
      </Routes>
    </API.Provider>
  ) : (
    <div className="flex min-h-screen px-3 items-center place-content-center">
      <LoginButton />
    </div>
  );
}
