import { useContext, useState } from "react";
import { Page } from "../../components/page";
import { Header } from "../../components/page/header";
import { API } from "../../state/auth";
import { Proposal } from "../../components/card/proposal";
import { Feed } from "../../components/card/feed";

export function MatchProposal() {
  const api = useContext(API);
  const [refreshSignal, setRefreshSignal] = useState(false);
  const refreshPage = () => {
    setRefreshSignal(!refreshSignal);
  };

  const nextPage = async (pageNum: number) => {
    const matches = await api.match().findProposed({ pageStart: pageNum });
    const ids = matches.flatMap((m) => m.players);
    // This will not include the current user
    const users = await api
      .user()
      .find({ query: { _id: { $in: ids } }, pageSize: ids.length });

    return matches.map((m) => {
      const opponent = users.filter((u) => u._id.equals(m.owner));
      if (opponent.length < 1) return;
      return (
        <Proposal
          key={m._id.toString()}
          className="mt-2"
          data={m}
          onAccept={() => {
            api
              .match()
              .accept(m._id)
              .then(() => {
                refreshPage();
              })
              .catch(console.warn);
          }}
          onDecline={() => {
            api
              .match()
              .cancel(m._id)
              .then(() => {
                refreshPage();
              })
              .catch(console.warn);
          }}
          opponent={opponent[0]}
        />
      );
    });
  };

  return (
    <Page page="home">
      <Page.Header>
        <Header.Back defaultLink="/" />
        Proposed Matches
      </Page.Header>
      <Page.Body scrollable>
        <div className="pb-2">
          <Feed nextPage={nextPage} refreshSignal={refreshSignal}>
            <Feed.Empty>You have no more match proposals.</Feed.Empty>
          </Feed>
        </div>
      </Page.Body>
    </Page>
  );
}
