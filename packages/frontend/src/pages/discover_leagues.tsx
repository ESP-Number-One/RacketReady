import type { ReactNode } from "react";
import { useContext } from "react";
import { BottomBar } from "../components/bottom_bar";
import { CardList } from "../components/card_list";
import { Page } from "../components/page";
import { Header } from "../components/page/header";
import { API } from "../state/auth";
import { Cards } from "../utils/types_to_cards";

export function DiscoverLeagues() {
  const api = useContext(API);

  const nextPage = async (pageNum: number) => {
    return new Promise<ReactNode[]>((res) => {
      res(
        api
          .league()
          .find({ pageStart: pageNum })
          .then((leagues) => {
            return Cards.fromLeagues(leagues, api);
          })
          .catch((e) => {
            console.warn(e);
            return [];
          }),
      );
    });
  };

  return (
    <Page>
      <Page.Header>
        <Header.Back />
        Discover Leagues
      </Page.Header>
      <Page.Body>
        <CardList
          nextPage={nextPage}
          emptyListPlaceholder="No more leagues found."
        />
      </Page.Body>
      <Page.Footer>
        <BottomBar activePage={"leagues"} />
      </Page.Footer>
    </Page>
  );
}
