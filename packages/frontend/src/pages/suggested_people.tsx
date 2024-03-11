import type { ReactNode } from "react";
import { useContext } from "react";
import { Page } from "../components/page";
import { useViewNav } from "../state/nav";
import { Search } from "../components/search";
import { API } from "../state/auth";
import { CardList } from "../components/card_list";
import { Cards } from "../utils/types_to_cards";

export function TestPage() {
  const viewNavigate = useViewNav();
  const api = useContext(API);
  const userAPI = api.user();

  return (
    <Page>
      <Page.Header>
        <div className="flex flex-row max-w-fit w-fit">
          <Search onSubmit={console.log} />
        </div>
      </Page.Header>
      <Page.Body>
        <CardList
          shouldSnap={true}
          nextPage={async () => {
            return new Promise<ReactNode[]>((res) => {
              res(
                userAPI
                  .find({})
                  .then((users) => {
                    return Cards.fromUsers(users, api);
                  })
                  .catch((e) => {
                    console.warn(e);
                    return [];
                  }),
              );
            });
          }}
        />
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
