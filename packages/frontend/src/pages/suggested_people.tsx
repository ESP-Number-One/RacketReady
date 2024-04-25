import { useContext, useMemo, useState, type JSX } from "react";
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

export function SuggestedPeople() {
  const api = useContext(API);

  const [search, setSearch] = useState("");
  const isSuggested = useMemo(() => search === "", [search]);
  const [myError, setMyError] = useState("");
  const [searchRes, setSearchRes] = useState<CensoredUser[]>([]);

  const [proposedTimes, setProposedTimes] = useState<Moment[]>([]);
  const [recommendations, setRecommendations] = useState<UserMatchReturn>([]);

  const userAPI = api.user();
  userAPI
    .recommendations()
    .then((users) => {
      setRecommendations(users);
    })
    .catch((e) => {
      console.warn(e);
      return [] as JSX.Element[];
    });

  const rawRecommendationAvailability = useMemo<
    Promise<
      {
        u: CensoredUser;
        sport: Sport;
        availability: Moment[];
      }[]
    >
  >(() => {
    return Promise.all(
      recommendations.map(async (recInfo) => {
        return {
          ...recInfo,
          availability: await userAPI
            .findAvailabilityWith(recInfo.u._id, {})
            .then((res) => res.map((t) => moment(t))),
        };
      }),
    );
  }, recommendations);

  const recommendationTimes = useMemo<
    Promise<
      {
        u: CensoredUser;
        sport: Sport;
        availability: Moment[];
      }[]
    >
  >(async () => {
    return rawRecommendationAvailability.then((raw) => {
      return raw.map((info) => {
        return {
          ...info,
          availability: info.availability.filter(
            (t) => !proposedTimes.some((b) => t.isSame(b)),
          ),
        };
      });
    });
  }, [rawRecommendationAvailability, proposedTimes]);

  const recCards = useMemo(async () => {
    return recommendationTimes.then((rt) =>
      rt.map((user) => {
        return (
          <RecProfile
            key={`${user.u._id.toString()}-${user.sport}`}
            user={user.u}
            availability={user.availability}
            sport={{ sport: user.sport, ability: AbilityLevel.Beginner }}
            proposeMatch={(proposal: MatchProposal) => {
              api.match().create(proposal).then().catch(console.warn);
              setProposedTimes([...proposedTimes, moment(proposal.date)]);
            }}
          />
        );
      }),
    );
  }, [recommendationTimes]);

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
          <Feed shouldSnap nextPage={recCards} />
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
