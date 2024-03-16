import { useContext, useMemo, useState } from "react";
import { makeImgSrc, type CensoredUser } from "@esp-group-one/types";
import { Page } from "../components/page";
import { Search } from "../components/search";
import { API } from "../state/auth";
import { CardList } from "../components/card_list";
import { Cards } from "../utils/types_to_cards";
import { ErrorDiv } from "../components/error";
import { Profile } from "../components/profile";
import { Link } from "../components/link";

export function SuggestedPeople() {
  const api = useContext(API);

  const [search, setSearch] = useState("");
  const isSuggested = useMemo(() => search === "", [search]);
  const [myError, setMyError] = useState("");
  const [searchRes, setSearchRes] = useState<CensoredUser[]>([]);

  return (
    <Page page="search">
      <Page.Header>
        <div className="flex flex-row max-w-fit w-fit m-2">
          <Search
            onSubmit={(q) => {
              setSearch(q);
              api
                .user()
                .find({ query: { profileText: q }, pageSize: 10 })
                .then((users) => {
                  setSearchRes(users);
                })
                .catch((e: Error) => {
                  setMyError(e.toString());
                  setSearchRes([]);
                });
            }}
          />
        </div>
      </Page.Header>
      <Page.Body className="overflow-y-scroll">
        <ErrorDiv error={myError} />
        {isSuggested ? (
          <CardList
            shouldSnap
            nextPage={(pageNum: number) => {
              if (pageNum === 0) {
                const userAPI = api.user();
                return userAPI
                  .recommendations()
                  .then((users) => {
                    return Cards.fromRecommendedUsers(users, api);
                  })
                  .catch((e) => {
                    console.warn(e);
                    return [];
                  });
              }

              return Promise.resolve([]);
            }}
          />
        ) : (
          searchRes.map((u) => (
            <Link
              key={u._id.toString()}
              href={`/profile?id=${u._id.toString()}`}
              className="rounded-lg border w-full border-gray-300 p-2 flex items-center bg-p-grey-200 mt-2"
            >
              <div className="mr-4">
                <div className="image-container">
                  <Profile imgSrc={makeImgSrc(u.profilePicture)} />
                </div>
              </div>
              <div className="flex flex-col flex-1">
                <div className="font-title font-bold text-2xl text-white">
                  {u.name}
                </div>
              </div>
            </Link>
          ))
        )}
      </Page.Body>
    </Page>
  );
}
