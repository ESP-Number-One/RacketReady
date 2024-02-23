import type { QueryOptions } from "@esp-group-one/types";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

interface CardListProps<T extends ReactNode> {
  pageSize: number;
  query: unknown;
  sort: unknown;
  nextPage: (nextQuery: QueryOptions) => Promise<T[]>;
}

export function CardList<T extends ReactNode>({
  pageSize,
  query,
  sort,
  nextPage,
}: CardListProps<T>) {
  const [pageNum, setPageNum] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  let cards: T[] = [];
  nextPage({
    query,
    sort,
    pageStart: pageNum,
    pageSize,
  })
    .then((result) => {
      setIsLastPage(result.length === 0);
      cards = cards.concat(result);
    })
    .catch((err) => {
      console.log(err);
    });

  function nextPageWrapper() {
    setIsLoading(true);
    setPageNum(pageNum + 1);
    nextPage({
      query,
      sort,
      pageStart: pageNum + 1,
      pageSize,
    })
      .then((result) => {
        cards = cards.concat(result);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }

  function handleScroll() {
    if (
      window.innerHeight + document.documentElement.scrollTop !==
      document.documentElement.offsetHeight
    ) {
      return;
    }
    nextPageWrapper();
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });
  return (
    <div className="flex flex-col overflow-clip h-full">
      {cards}
      {isLoading ? <p>Loading!</p> : null}
      {isLastPage ? <p>No more results.</p> : null}
    </div>
  );
}
