import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import type { ReactNode, UIEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface CardListProps<T extends ReactNode> {
  emptyListPlaceholder?: string;
  nextPage: (nextPage: number) => Promise<T[]>;
  refreshPage?: () => void;
  startPage?: number;
  emptyListPlaceholder?: string;
  shouldSnap?: boolean;
}

export function CardList<T extends ReactNode>({
  emptyListPlaceholder = "No more results",
  nextPage,
  refreshPage,
  startPage,
  emptyListPlaceholder = "No more results",
  shouldSnap,
}: CardListProps<T>) {
  const [pageNum, setPageNum] = useState(
    startPage !== undefined && startPage >= 0 ? startPage : 0,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shouldGetPage, setShouldGetPage] = useState(true);
  const blockNextPage = useRef<boolean>(false);
  const cards = useRef<T[]>([]);

  let y1: number;
  let y2: number;

  function refreshWrapper() {
    let newCards: T[] = [];
    setIsLoading(true);
    const promises = [...Array<number>(pageNum)].map((_, i) => {
      return nextPage(i);
    });

    if (refreshPage) {
      refreshPage();
    }

    Promise.all(promises)
      .then((results) => {
        for (const result of results) {
          if (result.length === 0) {
            setIsLastPage(true);
          }
          newCards = newCards.concat(result);
        }
        cards.current = newCards;
        setIsRefreshing(false);
        setIsLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setIsRefreshing(false);
      });
  }

  const touchStart = (e: TouchEvent) => {
    y1 = e.touches[0].pageY;
  };

  const touchMove = (e: TouchEvent) => {
    const target: EventTarget =
      e.target === null ? e.targetTouches[0].target : e.target;
    const targetDiv: HTMLDivElement = target as HTMLDivElement;
    y2 = e.touches[0].pageY;
    if (
      targetDiv.offsetTop <= 120 && // view is at top of screen
      y2 > y1 + 120 && // touch scrolled down by 120px
      !isLoading && // Don't update if already loading stuff
      !shouldGetPage // and don't up===date if already about to load stuff
    ) {
      setIsRefreshing(true);
      setIsLastPage(false);
      console.log("Refreshing messages");
    }
  };

  const touchEnd = (_e: TouchEvent) => {
    if (isRefreshing && !(isLoading || shouldGetPage)) {
      refreshWrapper();
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
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const target: EventTarget = event.target;
    const targetDiv: HTMLDivElement = target as HTMLDivElement;
    if (
      targetDiv.scrollTop + targetDiv.clientHeight <
        targetDiv.scrollHeight - targetDiv.clientHeight * 0.1 ||
      isLastPage ||
      isLoading ||
      shouldGetPage
    ) {
      return;
    }
    blockNextPage.current = false;
    setShouldGetPage(true);
  };

  useEffect(() => {
    if (!isLoading && !isLastPage && !blockNextPage.current) {
      blockNextPage.current = true;
      nextPageWrapper();
    }
    setShouldGetPage(false);
  }, [shouldGetPage]);

  return (
    <div
      className="grid-flow-row grid overflow-clip h-full items-top"
      style={
        shouldSnap
          ? { scrollSnapType: "y mandatory", scrollSnapStop: "always" }
          : {}
      }
      id="card-list"
    >
      <FontAwesomeIcon
        className={
          isRefreshing
            ? "duration-300 bg-white p-4 rounded-full self-center -rotate-180 shadow place-self-center"
            : "-translate-y-72 duration-300 bg-white p-4 rounded-full self-center rotate-180 shadow opacity-0 h-0 w-0"
        }
        icon={faRefresh}
        size="lg"
      />
      <div
        className="overflow-scroll absolute"
        onScroll={(e) => {
          handleScroll(e);
        }}
      >
        {cards.current}
      </div>
      {emptyListPlaceholder && cards.current.length === 0 ? (
        <div className="flex flex-row justify-center">
          <p className="p-2 font-title h-full text-p-grey-100">
            {emptyListPlaceholder}
          </p>
        </div>
      ) : null}
    </div>
  );
}
