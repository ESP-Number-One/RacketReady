import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import type { ReactNode } from "react";
import { useContext } from "react";
import { Page } from "../components/page";
import { Header } from "../components/page/header";
import { CardList } from "../components/card_list";
import { API } from "../state/auth";
import { Cards } from "../utils/types_to_cards";
import { useViewNav } from "../state/nav";

export function MatchProposal() {
  const api = useContext(API);

  const viewNavigate = useViewNav();

  const nextPage = (pageNum: number): Promise<ReactNode[]> => {
    let result: ReactNode[];
    api
      .match()
      .findProposed({ pageStart: pageNum })
      .then((matches) => {
        result = Cards.fromMatches(matches, api);
      })
      .catch((error) => {
        console.warn(error);
        result = [];
      });
    return new Promise<ReactNode[]>((res) => {
      res(result);
    });
  };

  return (
    <Page>
      <Page.Header>
        <Header.Back />
        Proposed Matches
      </Page.Header>
      <Page.Body>
        <CardList
          nextPage={nextPage}
          emptyListPlaceholder="You have no more match proposals."
        />
      </Page.Body>
      <Page.Footer>
        <button
          onClick={() => {
            viewNavigate("/match-proposals");
          }}
        >
          MatchProposal
        </button>
      </Page.Footer>
    </Page>
  );
}
