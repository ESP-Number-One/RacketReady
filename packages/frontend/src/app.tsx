import { Route, Routes } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { NewLeaguePage } from "./pages/league/new.js";
import { API, type AuthResult, handleApi } from "./state/auth.js";
import { LoginButton } from "./components/auth.js";
import { useAPIClient } from "./lib/auth.js";
import { UpcomingMatch } from "./pages/match/upcoming.js";
import { ProfilePage } from "./pages/profile.js";
import { SetAvailability } from "./pages/me/availability.js";
import { NewMatchPage } from "./pages/match/new.js";
import { SingleLeaguePage } from "./pages/league/single.js";
import { SingleMatchPage } from "./pages/match/index.js";
import { CompleteMatchForm } from "./pages/match/complete.js";
import { YourProfile } from "./pages/me/index.js";
import { MatchProposal } from "./pages/match/proposal.js";
import { EditSports, EditUser } from "./pages/me/edit.js";
import { YourLeagues } from "./pages/league/your.js";
import { DiscoverLeagues } from "./pages/league/discover.js";
import { SuggestedPeople } from "./pages/suggested_people.js";
import { SignUp } from "./pages/signup.js";
import { useViewNav } from "./state/nav.js";

export function App() {
  const [result, setResult] = useState({ type: "loading" } as AuthResult);
  const hasSetApi = useRef(false);
  const { isAuthenticated } = useAuth0();
  const api = useAPIClient(isAuthenticated);
  const viewNav = useViewNav();

  useEffect(() => {
    api
      .then(
        handleApi(hasSetApi, setResult, () => {
          viewNav("/signup");
        }),
      )
      .catch((err: string) => {
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

  return ok.authenticated ? (
    <API.Provider value={ok.client}>
      <Routes>
        <Route index element={<UpcomingMatch />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/me" element={<YourProfile />} />
        <Route path="/me/availability" element={<SetAvailability />} />
        <Route path="/me/edit" element={<EditUser />} />
        <Route path="/me/sports/edit" element={<EditSports />} />
        <Route path="/match/new" element={<NewMatchPage />} />
        <Route path="/league/:id" element={<SingleLeaguePage />} />
        <Route path="/match" element={<SingleMatchPage />} />
        <Route path="/match/complete" element={<CompleteMatchForm />} />
        <Route path="/match/proposals" element={<MatchProposal />} />
        <Route path="/league/new" element={<NewLeaguePage />} />
        <Route path="/leagues" element={<YourLeagues />} />
        <Route path="/leagues/discover" element={<DiscoverLeagues />} />
        <Route path="/search" element={<SuggestedPeople />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </API.Provider>
  ) : (
    <div className="flex min-h-screen px-3 items-center place-content-center">
      <LoginButton />
    </div>
  );
}
