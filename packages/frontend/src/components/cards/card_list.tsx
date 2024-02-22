import { UserAPIClient } from "@esp-group-one/api-client/build/src/sub/user";
import type { QueryOptions } from "@esp-group-one/types";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { LeagueAPIClient } from "@esp-group-one/api-client/build/src/sub/league";
import { MatchAPIClient } from "@esp-group-one/api-client/build/src/sub/match";
import { leagues2Cards, match2Cards, users2Cards } from "./conversion";

interface CardListProps {
  queryOptions: QueryOptions;
  clientType: "user" | "match" | "league";
}

export function CardList({ queryOptions, clientType }: CardListProps) {
  const [pageQuery, setPageQuery] = useState(queryOptions);
  let cards: ReactNode[] = [];

  function updateCardList() {
    switch (clientType) {
      case "user": {
        new UserAPIClient()
          .find(pageQuery)
          .then((users) => {
            cards = cards.concat(users2Cards(users));
          })
          .catch((err) => {
            console.log(`An error has occurred: ${err}`);
          });
        break;
      }
      case "match": {
        new MatchAPIClient()
          .find(pageQuery)
          .then((matches) => {
            cards = cards.concat(match2Cards(matches));
          })
          .catch((err) => {
            console.log(`An error has occurred: ${err}`);
          });
        break;
      }
      case "league": {
        new LeagueAPIClient()
          .find(pageQuery)
          .then((leagues) => {
            cards = cards.concat(leagues2Cards(leagues));
          })
          .catch((err) => {
            console.log(`An error has occurred: ${err}`);
          });
        break;
      }
    }
  }

  function handleScroll() {
    if (
      window.innerHeight + document.documentElement.scrollTop !==
      document.documentElement.offsetHeight
    ) {
      return;
    }
    const newPageQuery = pageQuery;
    if (newPageQuery.pageStart) {
      newPageQuery.pageStart++;
    } else {
      newPageQuery.pageStart = 0;
    }
    setPageQuery(newPageQuery);
    updateCardList();
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });
  updateCardList();
  return <div className="flex flex-col">{cards}</div>;
}
