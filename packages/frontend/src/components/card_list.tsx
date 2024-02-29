import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

  function refreshMessagesWrapper() {
    cards.current = [];
    for (let p = 0; p < pageNum; p++) {
      setIsLoading(true);
      nextPage(p)
        .then((result) => {
          console.log(result);
          if (result.length === 0) {
            setIsLastPage(true);
          }
          cards.current = cards.current.concat(result);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  let y1: number;
  let y2: number;

  const touchStart = (e: TouchEvent) => {
    y1 = e.touches[0].pageY;
  };

  const touchMove = (e: TouchEvent) => {
    y2 = e.touches[0].pageY;
    if (
      document.scrollingElement?.scrollTop === 0 &&
      y2 > y1 + 120 &&
      !isLoading
    ) {
      setIsLoading(true);
      console.log("Refreshing messages");
    }
  };

  const touchEnd = (_e: TouchEvent) => {
    if (isLoading) {
      refreshMessagesWrapper();
      console.log("refreshing done");
    }
  };

  useEffect(() => {
    window.addEventListener("touchstart", touchStart, { passive: true });
    return () => {
      window.removeEventListener("touchstart", touchStart);
    };
  });

  useEffect(() => {
    window.addEventListener("touchmove", touchMove, { passive: true });
    return () => {
      window.removeEventListener("touchmove", touchMove);
    };
  });

  useEffect(() => {
    window.addEventListener("touchend", touchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchend", touchEnd);
    };
  });

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
      isLoading ||
      shouldGetPage
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
      <FontAwesomeIcon
        className={
          isLoading
            ? "translate-y-24 duration-300 bg-white p-4 rounded-full flex self-center -rotate-180"
            : "-translate-y-72 duration-300 bg-white p-4 rounded-full flex self-center rotate-180"
        }
        icon={faRefresh}
        size="lg"
      />
      {cards.current}
      {isLoading ? <p>Loading!</p> : null}
      {isLastPage ? <p>No more results.</p> : null}
    </div>
  );
}
