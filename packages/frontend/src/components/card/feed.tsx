import {
  type ReactNode,
  useCallback,
  useEffect,
  useState,
  type ReactElement,
  useMemo,
  useRef,
} from "react";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoadingAnimation } from "../loading";
import { Slot } from "../../lib/slotting";

const PULL_DOWN_THRESHOLD = 80;

//#region Utilities

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

type FeedFunc<Item> = (
  page: number,
) => Promise<Item[] | Record<string, Item[]>>;

function process<Item>({
  items,
  page,
}: {
  items: Record<string, Item[]>;
  page: number;
}): (delta: Item[] | Record<string, Item[]>) => {
  items: Record<string, Item[]>;
  page: number;
} {
  return (delta) => {
    let newPage = page;
    const update = ([key, value]: [string, Item[]]) => {
      newPage += value.length;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- this is necessary
      items[key] = [...(items[key] ?? []), ...value];
    };

    if (Array.isArray(delta)) {
      update(["__DEFAULT__", delta]);
    } else {
      Object.entries(delta).forEach(update);
    }

    return { items, page: newPage };
  };
}

function isEmpty<I>(items: Record<string, I[]>): boolean {
  return Object.values(items).reduce((a, b) => a + b.length, 0) === 0;
}

//#endregion

//#region Slots
/**
 * Allows you to divde a feed into multiple sections.
 * ***
 * ### Usage
 * First, your async function must be of the form:
 * ```ts
 * async function func(page: number) {
 *    // Do stuff...
 *    return {
 *      "section-name": section1,
 *      "section-2": section2,
 *      // . . .
 *    }
 * }
 * ```
 *
 * Then, you can embed a `<Form.Section>` tag in your `<Feed>`:
 * ```tsx
 * <Feed nextPage={func}>
 *    <Feed.Section section="section-name" />
 * </Feed>
 * ```
 *
 * Sections may also have optional headers:
 * ```tsx
 * <Feed.Section section="apples">
 *    Pictures of apples:
 * </Feed.Section>
 * ```
 * ***
 * ### Examples
 * @example
 * ```tsx
 * <Feed nextPage={func}>
 *    <Feed.Section section="section-name">
 *      <div className="font-bold">Example Section</div>
 *    </Feed.Section>
 * </Feed>
 * ```
 */
function Section({
  children,
  section: _,
}: {
  children?: ReactNode[] | ReactNode;
  section: string;
}) {
  return <>{children}</>;
}

/**
 * Shown when the feed is empty.
 *
 * ### Usage
 *
 * @example
 * ```tsx
 * <Feed nextPage={someFunc}>
 *    <Feed.Empty>
 *      You have no friends.
 *    </Feed.Empty>
 * </Feed>
 * ```
 */
function Empty({ children }: { children: ReactNode | ReactNode[] }) {
  return children;
}

/**
 * Shown when the user has reached the end of the feed.
 *
 * ### Default
 * ```tsx
 * <Feed.End>You&apos;ve reached the end.</Feed.End>
 * ```
 * ***
 * ### Example
 * ```tsx
 * <Feed nextPage={func}>
 *    <Feed.End>There&apos;s no more content left.</Feed.End>
 * </Feed>
 * ```
 */
function EndF({ children }: { children: ReactNode | ReactNode[] }) {
  return children;
}

/**
 * Shown whilst the feed is loading.
 * ### Default
 * ```tsx
 * <Feed.Loading><LoadingAnimation /></Feed.Loading>
 * ```
 * ***
 * ### Example
 * ```tsx
 * <Feed nextPage={func}>
 *    <Feed.Loading>Getting more content for &apos;ya!</Feed.Loading>
 * </Feed>
 * ```
 */
function LoadingF({ children }: { children: ReactNode | ReactNode[] }) {
  return children;
}

//#endregion

/**
 * @typeParam Item - The items' component.
 * @returns A feed of type `Item`.
 */
function FeedImpl<Item extends ReactNode>({
  nextPage: next,
  startPage = 0,
  pageSize = 20,
  children,
  shouldSnap = false,
}: {
  nextPage: FeedFunc<Item>;
  startPage?: number;
  pageSize?: number;
  children?: ReactNode[] | ReactNode;
  shouldSnap?: boolean;
}) {
  const [page, setPage] = useState(startPage);
  const [init, setInit] = useState(true);
  const [items, setItems] = useState<Record<string, Item[]>>({});
  const [state, setState] = useState(FeedState.Loading);

  useEffect(() => {
    setPage(0);
    setItems({});
    setState(FeedState.Loading);
  }, [next]);

  const load = useCallback(
    () =>
      void next(page).then((delta) => {
        const oldPage = page;
        const { items: newItems, page: newPage } = process({ items, page })(
          delta,
        );
        setPage(newPage);

        if (newPage - oldPage < pageSize) setState(FeedState.End);
        else setState(FeedState.Waiting);

        setItems(newItems);
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
        load();
        break;
      case FeedState.Refresh:
        setPage(startPage);
        setItems({});
        setState(FeedState.Loading);
        break;
      default:
        break;
    }
  }, [state, load]);

  // Slots

  const loading = Slot.findOrDefault(
    children,
    <LoadingF key={`loading-${Math.random()}`}>
      <LoadingAnimation />
    </LoadingF>,
  );

  const empty = Slot.findOrDefault(
    children,
    <Empty key={`empty-${Math.random()}`}>
      <div className="flex flex-row justify-center h-full">
        <p className="p-2 font-title self-center text-p-grey-100">
          Couldn&apos;t find anything.
        </p>
      </div>
    </Empty>,
  );

  const end = Slot.findOrDefault(
    children,
    <EndF key={`end-${Math.random()}`}>
      <div className="flex flex-row justify-center h-full">
        <p className="p-2 font-title h-full text-p-grey-100">
          You&apos;ve reached the end.
        </p>
      </div>
    </EndF>,
  );

  const slots = useMemo(() => {
    const sections = Slot.filterOrDefault(
      children,
      <Section section="__DEFAULT__" key="__DEFAULT__" />,
    ).map((section) => {
      const { props, key } = section as ReactElement<{
        children?: ReactNode[];
        section: string;
      }>;

      // eslint-disable-next-line react/prop-types -- Why is this a thing?
      const s = props.section;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Necessary -- we don't know if this is defined!
      return items[s]?.length > 0 ? (
        <div className="contents" key={`${key}-${Math.random()}`}>
          {props.children}
          {items[s]}
        </div>
      ) : null;
    });

    return [
      ...sections,
      ...(state === FeedState.End && isEmpty(items) ? [empty] : []),
      ...(state === FeedState.End && !isEmpty(items) ? [end] : []),
    ];
  }, [init, items, page, state, next]);

  // Pull down to refresh.

  const [refreshY, setRefreshY] = useState(0);
  const scroller = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scroller.current) return () => void 0;
    const container = scroller.current;

    const touchState = { startY: 0, set: false, delta: 0 };
    function start(this: HTMLDivElement, _: TouchEvent) {
      // This is in intentionally left blank.
    }

    function move(this: HTMLDivElement, e: TouchEvent) {
      if (this.scrollTop !== 0) return;
      if (e.targetTouches.length === 0) return;

      const touch = e.targetTouches[0] as unknown as Touch;

      if (!touchState.set) {
        touchState.set = true;
        touchState.startY = touch.clientY;
        return;
      }

      touchState.delta = touchState.startY - touch.clientY;
      if (touchState.delta > 0) {
        touchState.set = false;
        touchState.startY = 0;
        return;
      }
      setRefreshY(-touchState.delta);
    }

    function lift(this: HTMLDivElement, _: TouchEvent) {
      if (this.scrollTop !== 0) return;

      if (touchState.set) {
        touchState.startY = 0;
        touchState.set = false;
        setRefreshY(0);

        if (-touchState.delta > PULL_DOWN_THRESHOLD)
          setState(FeedState.Refresh);
      }
    }

    container.addEventListener("touchstart", start, { passive: true });
    container.addEventListener("touchmove", move, { passive: true });
    container.addEventListener("touchend", lift, { passive: true });

    return () => {
      container.removeEventListener("touchstart", start);
      container.removeEventListener("touchmove", move);
      container.removeEventListener("touchend", lift);
    };
  }, [scroller]);

  // Scroll to load.
  useEffect(() => {
    if (!scroller.current) return;
    const container = scroller.current;

    function scrollHandler(this: HTMLDivElement, _: unknown) {
      if ((this.scrollTop + this.clientHeight) / this.scrollHeight < 0.9)
        return;

      if (state !== FeedState.Waiting) return;

      setState(FeedState.Loading);
    }
    container.addEventListener("scroll", scrollHandler);

    return () => {
      container.removeEventListener("scroll", scrollHandler);
    };
  }, [scroller, state]);

  return (
    <div
      className={`h-full overflow-y-scroll grid grid-flow-row ${
        isEmpty(items) || state ? "" : "auto-rows-max"
      } relative`}
      ref={scroller}
      style={
        shouldSnap
          ? { scrollSnapType: "y mandatory", scrollSnapStop: "always" }
          : {}
      }
    >
      <div
        className={`justify-self-center overflow-hidden absolute`}
        style={{
          top: -70 + Math.min(refreshY / 1.5, 80),
        }}
      >
        <FontAwesomeIcon
          icon={faRefresh}
          size="2x"
          className={`p-3 rounded-full border-2 drop-shadow-sm bg-white`}
          style={{
            color:
              refreshY >= PULL_DOWN_THRESHOLD ? "rgb(41 128 185)" : "initial",
            rotate: `${Math.max(refreshY, 0) / 3}deg`,
            opacity: Math.max(refreshY / PULL_DOWN_THRESHOLD / 1.2, 0),
            transition: "opacity 100ms linear, color 100ms linear",
          }}
        />
      </div>
      {slots}
      {state === FeedState.Loading ? loading : null}
    </div>
  );
}

interface SlotI {
  Section: typeof Section;
  Empty: typeof Empty;
  End: typeof EndF;
  Loading: typeof LoadingF;
}

export const Feed: typeof FeedImpl & SlotI = FeedImpl as typeof FeedImpl &
  SlotI;
Feed.Section = Section;
Feed.Empty = Empty;
Feed.End = EndF;
Feed.Loading = LoadingF;
