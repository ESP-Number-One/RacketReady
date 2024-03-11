import type { ReactNode } from "react";
import { useContext } from "react";
import { Page } from "../components/page";
import { Search } from "../components/search";
import { API } from "../state/auth";
import { CardList } from "../components/card_list";
import { Cards } from "../utils/types_to_cards";
import { BottomBar } from "../components/bottom_bar";

export function TestPage() {
  const api = useContext(API);
  const userAPI = api.user();

  const nextPage = async (pageNum: number) => {
    return new Promise<ReactNode[]>((res) => {
      res(
        userAPI
          .find({ pageStart: pageNum })
          .then((users) => {
            return Cards.fromUsers(users, api);
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
        <div className="flex flex-row max-w-fit w-fit">
          <Search onSubmit={console.log} />
        </div>
      </Page.Header>
      <Page.Body>
        <CardList shouldSnap={true} nextPage={nextPage} />
      </Page.Body>
      <Page.Footer>
        <BottomBar activePage={"search"} />
      </Page.Footer>
    </Page>
  );
}
