import type { ReactNode } from "react";
import { useContext } from "react";
import { Page } from "../../components/page";
import { Header } from "../../components/page/header";
import { API } from "../../state/auth";
import { Cards } from "../../utils/types_to_cards";
import { Feed } from "../../components/card/feed";

export function DiscoverLeagues() {
  const api = useContext(API);

  const nextPage = async (pageNum: number) => {
    return new Promise<ReactNode[]>((res) => {
      res(
        api
          .league()
          .find({ query: { amIn: false }, pageStart: pageNum })
          .then((leagues) => {
            return Cards.fromLeagues(leagues);
          })
          .catch((e) => {
            console.warn(e);
            return [];
          }),
      );
    });
  };

  return (
    <Page page="leagues">
      <Page.Header>
        <Header.Back defaultLink="/leagues" />
        Discover Leagues
      </Page.Header>
      <Page.Body scrollable spacing>
        <Feed nextPage={nextPage}>
          <Feed.Empty>No more leagues found.</Feed.Empty>
        </Feed>
      </Page.Body>
    </Page>
  );
}
