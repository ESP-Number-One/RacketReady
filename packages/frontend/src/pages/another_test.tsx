import { useContext, useEffect, useState } from "react";
import { MatchStatus, ObjectId, Sport, type User } from "@esp-group-one/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { API } from "../state/auth";
import { Page } from "../components/page";
import { Header } from "../components/page/header";
import { useViewNav } from "../state/nav";
import { MatchCard } from "../components/card/matchcard";

export function AnotherTestPage() {
  const api = useContext(API);
  const [user, setUser] = useState(undefined as undefined | User);
  const viewNavigate = useViewNav();

  useEffect(() => {
    api.user().me().then(setUser).catch(console.warn);
  }, [api]);

  return (
    <Page>
      <Page.Header>
        <Header.Back />
        Whatever goes in here, stays in here.
        <Header.Right>
          <FontAwesomeIcon icon={faPlus} />
        </Header.Right>
      </Page.Header>
      <Page.Body>
        {user !== undefined ? (
          // <div className=" bg-red-700">{JSON.stringify(user)}</div>
          <MatchCard
            match={{
              _id: new ObjectId("65ea530aae8cf768c16d488c"),
              date: "2024-03-07T23:51:38.606Z",
              messages: [],
              owner: new ObjectId("65df0cc4c3a02eabf84efbaf"),
              players: [
                new ObjectId("65df0cc4c3a02eabf84efbaf"),
                new ObjectId("65e5d03224bc2262eb90c038"),
              ],
              sport: Sport.Badminton,
              status: MatchStatus.Accepted,
              league: new ObjectId("65ea51e74a4ce720adfda7f4"),
              round: 1,
            }}
          />
        ) : (
          <p>Loading</p>
        )}
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
  );
}
