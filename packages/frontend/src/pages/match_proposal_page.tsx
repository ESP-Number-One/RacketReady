import { useContext } from "react";
import { Page } from "../components/page";
import { Header } from "../components/page/header";
import { CardList } from "../components/card_list";
import { API } from "../state/auth";
import { Cards } from "../utils/types_to_cards";
import { BottomBar } from "../components/bottom_bar";
import { useViewNav } from "../state/nav";

export function MatchProposal() {
  const api = useContext(API);
  const viewNavigate = useViewNav();

  const nextPage = async (pageNum: number) => {
    return Cards.fromMatches(
      await api.match().findProposed({ pageStart: pageNum }),
      api,
    );
  };

  return (
    <Page>
      <Page.Header>
        <Header.Back
          onClick={() => {
            viewNavigate("/");
          }}
        />
        Proposed Matches
      </Page.Header>
      <Page.Body>
        <CardList
          nextPage={nextPage}
          emptyListPlaceholder="You have no more match proposals."
        />
      </Page.Body>
      <Page.Footer>
        <BottomBar activePage={"home"} />
      </Page.Footer>
    </Page>
  );
}
