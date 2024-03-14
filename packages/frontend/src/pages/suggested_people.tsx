import type { ReactNode } from "react";
import { useContext, useState } from "react";
import { Page } from "../components/page";
import { Search } from "../components/search";
import { API } from "../state/auth";
import { CardList } from "../components/card_list";
import { Cards } from "../utils/types_to_cards";
import { BottomBar } from "../components/bottom_bar";

export function SuggestedPeople() {
  const api = useContext(API);
  const userAPI = api.user();
  const [search, setSearch] = useState("");
  const [isSuggested, setSuggested] = useState(true);

  return (
    <Page>
      <Page.Header>
        <div className="flex flex-row max-w-fit w-fit">
          <Search
            onSubmit={(q) => {
              setSuggested(false);
              setSearch(q);
            }}
          />
        </div>
      </Page.Header>
      <Page.Body>
        <CardList
          key={search}
          shouldSnap={true}
          nextPage={async (pageNum: number) => {
            if (isSuggested) {
              setSuggested(false);
              return new Promise<ReactNode[]>((res) => {
                res(
                  userAPI
                    .recommendations()
                    .then((users) => {
                      return Cards.fromRecommendedUsers(users, api);
                    })
                    .catch((e) => {
                      console.warn(e);
                      return [];
                    }),
                );
              });
            } else if (search === "") {
              return new Promise<ReactNode[]>((res) => {
                res([]);
              });
            }
            return new Promise<ReactNode[]>((res) => {
              res(
                userAPI
                  .find({ query: { profileText: search }, pageStart: pageNum })
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
        <BottomBar activePage={"search"} />
      </Page.Footer>
    </Page>
  );
}
