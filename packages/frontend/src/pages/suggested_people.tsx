import { useContext, useMemo, useState, useEffect, ReactNode } from "react";
import { makeImgSrc, AbilityLevel } from "@esp-group-one/types";
import type {
  UserMatchReturn,
  Sport,
  MatchProposal,
  CensoredUser,
} from "@esp-group-one/types";
import type { Moment } from "moment";
import moment from "moment";
import { Page } from "../components/page";
import { Search } from "../components/search";
import { API } from "../state/auth";
import { ErrorDiv } from "../components/error";
import { Profile } from "../components/profile";
import { Link } from "../components/link";
import { Feed } from "../components/card/feed";
import { RecProfile } from "../components/rec_profile";
import { useAsync } from "../lib/async";

export function SuggestedPeople() {
  const api = useContext(API);

  const [search, setSearch] = useState("");
  const isSuggested = useMemo(() => {
    console.log("Search updated");
    return search === "";
  }, [search]);
  const [myError, setMyError] = useState("");
  const [searchRes, setSearchRes] = useState<CensoredUser[]>([]);

  const [proposedTimes, setProposedTimes] = useState<Moment[]>([]);

  const userAPI = api.user();

  const { loading, error, ok } = useAsync<{
    recommendations: UserMatchReturn;
  }>(async () => {
    return { recommendations: await userAPI.recommendations() };
  })
    .catch((err) => <>{err.message}</>)
    .await();

  const [rawRecAvail, setRawRecAvail] = useState<
    {
      u: CensoredUser;
      sport: Sport;
      availability: Moment[];
    }[]
  >([]);

  useEffect(() => {
    if (!ok) return;
    console.log(ok);
    Promise.all(
      ok.recommendations.map(async (recInfo) => {
        return {
          ...recInfo,
          availability: await userAPI
            .findAvailabilityWith(recInfo.u._id, {})
            .then((res) => res.map((t) => moment(t))),
        };
      }),
    ).then(setRawRecAvail);
  }, [ok, setRawRecAvail]);

  const [recommendationTimes, setRecommendationTimes] = useState<
    {
      u: CensoredUser;
      sport: Sport;
      availability: Moment[];
    }[]
  >([]);

  useEffect(() => {
    console.log({ proposedTimes, rawRecAvail });
    setRecommendationTimes(
      rawRecAvail
        .map((info) => {
          return {
            ...info,
            availability: info.availability
              .filter(
                (t) =>
                  moment().isBefore(t) &&
                  !proposedTimes.some((b) => t.isSame(b)),
              )
              .slice(0, 3),
          };
        })
        .filter((info) => info.availability.length > 0),
    );
  }, [rawRecAvail, proposedTimes, setRecommendationTimes]);

  const [recCards, setRecCards] = useState<ReactNode[]>([]);

  useEffect(() => {
    console.log({ recommendationTimes });
    setRecCards(
      recommendationTimes.map((user) => {
        return (
          <RecProfile
            key={`${user.u._id.toString()}-${user.sport}`}
            user={user.u}
            availability={user.availability}
            sport={{ sport: user.sport, ability: AbilityLevel.Beginner }}
            proposeMatch={(proposal: MatchProposal) => {
              console.log("Proposing match");
              console.log(proposal);
              api.match().create(proposal).then().catch(console.warn);
              setProposedTimes([...proposedTimes, moment(proposal.date)]);
            }}
          />
        );
      }),
    );
  }, [recommendationTimes, setRecCards]);

  if (!ok) return (loading ?? error) as ReactNode;

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
          <Feed shouldSnap nextPage={Promise.resolve(recCards)} />
        ) : (
          searchRes.map((u) => (
            <Link
              key={u._id.toString()}
              href={`/profile/${u._id.toString()}`}
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
