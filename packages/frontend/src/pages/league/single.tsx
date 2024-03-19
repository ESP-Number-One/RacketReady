import { useContext, type JSX, useState, useMemo, useCallback } from "react";
import { redirect, useNavigate, useParams } from "react-router-dom";
import {
  type CensoredUser,
  ObjectId,
  Sort,
  type Match,
} from "@esp-group-one/types";
import moment from "moment";
import {
  faBan,
  faCalendar,
  faHandshake,
  faShareSquare,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { API } from "../../state/auth";
import { useAsync } from "../../lib/async";
import { Page } from "../../components/page";
import { Header } from "../../components/page/header";
import { Button } from "../../components/button";
import { Icon } from "../../components/icon";
import { LeagueMatch } from "../../components/card/league_match";
import { Feed } from "../../components/card/feed";

function RoundMatches({ round, league }: { round: number; league: ObjectId }) {
  const api = useContext(API);
  const playerCache = useMemo(
    () => ({}) as Record<string, CensoredUser>,
    [round],
  );

  const nextPage = useCallback(
    async (pageStart: number) => {
      const matches = await api.match().find({
        query: { league, round },
        sort: { date: Sort.DESC },
        pageStart,
      });

      const toGet = matches
        .flatMap(({ players }) => players)
        .filter((player) => !(player.toString() in playerCache));

      if (toGet.length > 0) {
        const users = api.user();
        await Promise.all(
          toGet.map((id) =>
            users
              .getId(id)
              .then((pl) => [id.toString(), pl] as [string, CensoredUser]),
          ),
        ).then((players) => {
          players.forEach(([id, pl]) => (playerCache[id] = pl));
        });
      }

      const cardify = (match: Match, i: number) => {
        return <LeagueMatch key={i} match={match} players={playerCache} />;
      };

      const now = moment();

      const future = matches.filter((m) =>
        moment(m.date).add(1, "hour").isAfter(now),
      );

      const past = matches.filter((m) =>
        moment(m.date).add(1, "hour").isBefore(now),
      );

      future.sort((a, b) => moment(a.date).diff(moment(b.date)));
      past.sort((a, b) => moment(b.date).diff(moment(a.date)));
      return {
        past: past.map(cardify),
        future: future.map(cardify),
      };
    },
    [round],
  );

  return (
    <Feed nextPage={nextPage}>
      <Feed.Section section="future">
        <div className=" tracking-widest uppercase font-bold p-2 text-p-grey-900">
          future matches
        </div>
      </Feed.Section>
      <Feed.Section section="past">
        <div className=" tracking-widest uppercase font-bold p-2 text-p-grey-900">
          past matches
        </div>
      </Feed.Section>
    </Feed>
  );
}

export function SingleLeaguePage() {
  const api = useContext(API);
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedRound, setSelectedRound] = useState(1);
  const [isMember, setIsMember] = useState(false);

  if (id === undefined) {
    redirect("/me/leagues");
    return <></>;
  }

  let leagueId: ObjectId;
  try {
    leagueId = new ObjectId(id);
  } catch (e) {
    return <>Error: not valid league id!</>;
  }

  const { loading, error, ok } = useAsync(async () => {
    await api
      .user()
      .me()
      .then((me) => {
        setIsMember(me.leagues.some((l) => l.equals(leagueId)));
      });

    return {
      league: await api
        .league()
        .getId(leagueId)
        .then((l) => {
          setSelectedRound(l.round);
          return l;
        }),
      firstMatch: await api.match().find({
        query: { league: leagueId },
        sort: { date: Sort.ASC },
        pageSize: 1,
      }),
      lastMatch: await api.match().find({
        query: { league: leagueId },
        sort: { date: Sort.DESC },
        pageSize: 1,
      }),
      rounds: await api.league().rounds(leagueId),
    };
  }).await();

  if (!ok) return (loading ?? error) as JSX.Element;
  const {
    league,
    firstMatch,
    lastMatch,
    rounds: { rounds },
  } = ok;

  let [firstDate, lastDate] = ["TBD", "TBD"];

  if (firstMatch.length && lastMatch.length) {
    firstDate = moment(firstMatch[0].date).format("DD/MM");
    lastDate = moment(lastMatch[0].date).format("DD/MM");
  }

  return (
    <Page page="leagues">
      <Page.Header>
        <Header.Back defaultLink="/leagues" />
        {league.name}
      </Page.Header>
      <Page.Body className="flex flex-col">
        <div className="w-full flex items-center p-2">
          <div className="text-3xl font-title font-bold text-p-grey-900 p-1">
            {firstDate}
          </div>
          <div className="flex-grow justify-center flex">
            <div className="spacer h-[4px] w-[20vw] bg-p-grey-900" />
          </div>
          <div className="text-3xl font-title font-bold text-p-grey-900 p-1">
            {lastDate}
          </div>
        </div>
        <div className="p-4 pb-0 flex flex-col grow min-h-0">
          <Button
            backgroundColor="bg-p-grey-200"
            onClick={() => {
              navigate("/", { state: { filter: { match: id } } });
            }}
            icon={<Icon icon={faCalendar} />}
          >
            Your Matches
          </Button>
          <div className="row grid grid-cols-2 mt-2 gap-2">
            <Button
              icon={<Icon icon={faShareSquare} />}
              onClick={() => {
                // Only works on phones.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- NOT ALWAYS FALSE, ESLINT!
                if (!window.navigator?.share) return;
                void window.navigator.share({
                  url: location.href,
                  title: league.name,
                  text: `Checkout "${league.name}" on RacketReady!`,
                });
              }}
            >
              Share
            </Button>
            {isMember ? (
              <Button
                backgroundColor="bg-p-red-100"
                icon={<Icon icon={faBan} />}
                onClick={() => {
                  console.warn("Unimplemented!");
                }}
              >
                Leave
              </Button>
            ) : (
              <Button
                backgroundColor="bg-p-blue"
                icon={<Icon icon={faHandshake} />}
                onClick={() => {
                  void api
                    .league()
                    .join(leagueId)
                    .then(() => {
                      setIsMember(true);
                    });
                }}
              >
                Join
              </Button>
            )}
          </div>
          <div className="rounds grid grid-flow-col auto-cols-max gap-x-2 overflow-x-scroll pt-2 flex-shrink-0">
            {rounds.map((number, i) => (
              <div
                key={i}
                className={twMerge(
                  "rounded-full text-white font-bold text-xl px-4 py-[2px] tracking-widest transition-all",
                  Number(number) === selectedRound
                    ? "bg-p-blue"
                    : "bg-p-grey-200",
                )}
                onClick={() => {
                  setSelectedRound(number);
                }}
              >
                RND. {number}
              </div>
            ))}
          </div>
          <div className="divider w-full flex my-1">
            <div className="spacer h-[4px] flex-grow bg-p-grey-900" />
          </div>
          <div className="flex-grow p-2 overflow-hidden">
            <RoundMatches round={selectedRound} league={leagueId} />
          </div>
        </div>
      </Page.Body>
    </Page>
  );
}
