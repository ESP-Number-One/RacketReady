import { type ReactNode, useCallback, useEffect, useState } from "react";
import { LoadingAnimation } from "../loading";

enum FeedState {
  /**
   * The feed has reached the end of the data stream.
   */
  End,

  /**
   * The feed is getting more data from the server.
   */
  Loading,

  /**
   * The lastest fetch encountered an error.
   */
  Error,

  /**
   * The feed has loaded, waiting for the user to reach the end.
   */
  Waiting,

  /**
   * Reload the entire collection.
   */
  Refresh,
}

/**
 * @typeParam Item - The items' component.
 * @returns A feed of type `Item`.
 */
export function Feed<Item extends ReactNode>({
  next,
  startPage = 0,
  pageSize = 20,
}: {
  next: (page: number) => Promise<Item[]>;
  startPage?: number;
  pageSize?: number;
}) {
  const [page, setPage] = useState(startPage);
  const [init, setInit] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [state, setState] = useState(FeedState.Loading);

  useEffect(() => {
    const func = (e: KeyboardEvent) => {
      console.log(e.code);
      if (e.code === "KeyL" && state === FeedState.Waiting)
        setState(FeedState.Loading);

      if (e.code === "KeyR" && state !== FeedState.Loading)
        setState(FeedState.Refresh);
    };
    document.addEventListener("keyup", func);
    return () => {
      document.removeEventListener("keyup", func);
    };
  }, [state]);

  useEffect(() => {
    setPage(0);
    setItems([]);
    setState(FeedState.Loading);
  }, [next]);

  const load = useCallback(
    () =>
      void next(page).then((newItems) => {
        setPage((pg) => pg + newItems.length);

        if (newItems.length < pageSize) setState(FeedState.End);
        else setState(FeedState.Waiting);

        setItems((it) => [...it, ...newItems]);
      }),
    [next, init, page, state],
  );

  useEffect(() => {
    if (init) {
      setInit(false);
      return;
    }

    switch (state) {
      case FeedState.Loading:
        console.log("FETCHING!");
        load();
        break;
      case FeedState.Refresh:
        setPage(startPage);
        setItems([]);
        setState(FeedState.Loading);
        break;
      default:
        break;
    }
  }, [state, load]);

  return (
    <div className="h-full overflow-y-scroll grid grid-flow-row auto-rows-max">
      {items}
      {state === FeedState.Loading ? <LoadingAnimation /> : null}
    </div>
  );
}
