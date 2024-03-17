import { useContext } from "react";
import { Page } from "../../components/page";
import { Header } from "../../components/page/header";
import { CardList } from "../../components/card_list";
import { API } from "../../state/auth";
import { useViewNav } from "../../state/nav";
import { Proposal } from "../../components/card/proposal";

export function MatchProposal() {
  const api = useContext(API);
  const viewNavigate = useViewNav();

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
            // TODO: refresh page
            api.match().accept(m._id).catch(console.warn);
          }}
          onDecline={() => {
            // TODO: refresh page
            api.match().cancel(m._id).catch(console.warn);
          }}
          opponent={opponent[0]}
        />
      );
    });
  };

  return (
    <Page page="home">
      <Page.Header>
        <Header.Back
          onClick={() => {
            viewNavigate("/");
          }}
        />
        Proposed Matches
      </Page.Header>
      <Page.Body scrollable>
        <div className="pb-2">
          <CardList
            nextPage={nextPage}
            emptyListPlaceholder="You have no more match proposals."
          />
        </div>
      </Page.Body>
    </Page>
  );
}
