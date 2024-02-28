import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

interface CardListProps<T extends ReactNode> {
  nextPage: (nextPage: number) => Promise<T[]>;
  startPage?: number;
}

export function CardList<T extends ReactNode>({
  nextPage,
  startPage,
}: CardListProps<T>) {
  const [pageNum, setPageNum] = useState(
    startPage !== undefined && startPage >= 0 ? startPage : 0,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const [shouldGetPage, setShouldGetPage] = useState(true);
  const cards = useRef<T[]>([]);

  function nextPageWrapper() {
    setIsLoading(true);
    setPageNum(pageNum + 1);
    nextPage(pageNum)
      .then((result) => {
        if (result.length === 0) {
          setIsLastPage(true);
        }
        cards.current = cards.current.concat(result);
        setShouldGetPage(false);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setShouldGetPage(false);
        setIsLoading(false);
      });
  }

  function handleScroll() {
    if (
      window.innerHeight + document.documentElement.scrollTop <
        document.documentElement.offsetHeight - 30 ||
      isLastPage ||
      isLoading
    ) {
      return;
    }
    setShouldGetPage(true);
  }

  useEffect(() => {
    nextPageWrapper();
  }, [shouldGetPage]);
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });
  return (
    <div className="flex flex-col overflow-clip h-full m-1">
      {cards.current}
      {isLoading ? <p>Loading!</p> : null}
      {isLastPage ? <p>No more results.</p> : null}
    </div>
  );
}
