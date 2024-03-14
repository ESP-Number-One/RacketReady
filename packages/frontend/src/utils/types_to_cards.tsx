import { MatchStatus } from "@esp-group-one/types";
import type {
  CensoredLeague,
  CensoredUser,
  DateTimeString,
  Match,
  ObjectId,
  Sport,
  UserMatchReturn,
} from "@esp-group-one/types";
import type { ReactNode } from "react";
import type { APIClient } from "@esp-group-one/api-client";
import moment from "moment";
import { Proposal } from "../components/proposal";
import { RecProfile } from "../components/rec_profile";
import { LeagueCard } from "../components/card/league";

export namespace Cards {
  export function fromUsers(users: CensoredUser[], api: APIClient) {
    return Promise.all(
      (() => {
        return users.map(async (user) => {
          return (
            <RecProfile
              key={user._id.toString()}
              user={user}
              availability={(
                await api.user().findAvailabilityWith(user._id, {})
              ).map((time) => {
                return moment(time);
              })}
              proposeMatch={(
                date: DateTimeString,
                to: ObjectId,
                sport: Sport,
              ) => {
                api
                  .match()
                  .create({ date, to, sport })
                  .then()
                  .catch(console.warn);
              }}
            />
          );
        });
      })(),
    ).then((cards) => {
      return cards;
    });
  }

  export function fromRecommendedUsers(users: UserMatchReturn, api: APIClient) {
    return Promise.all(
      (() => {
        return users.map(async (user) => {
          return (
            <RecProfile
              key={user.u._id.toString()}
              user={{
                ...user.u,
                sports: [
                  {
                    sport: user.sport,
                    ability: user.u.sports.filter((info) => {
                      return info.sport === user.sport;
                    })[0].ability,
                  },
                ],
              }}
              availability={(
                await api.user().findAvailabilityWith(user.u._id, {})
              ).map((time) => {
                return moment(time);
              })}
              proposeMatch={(
                date: DateTimeString,
                to: ObjectId,
                sport: Sport,
              ) => {
                api
                  .match()
                  .create({ date, to, sport })
                  .then()
                  .catch(console.warn);
              }}
            />
          );
        });
      })(),
    ).then((cards) => {
      return cards;
    });
  }

  export function fromLeagues(leagues: CensoredLeague[]) {
    return leagues.map((league) => {
      return (<LeagueCard data={league} />) as ReactNode;
    });
  }
  export function fromMatches(matches: Match[], api: APIClient) {
    return matches.map((match) => {
      let card: ReactNode;
      switch (match.status) {
        case MatchStatus.Accepted: {
          console.warn("Unimplemented conversion!");
          card = <div className="p-5 bg-p-grey-100">Unimplemented</div>;
          break;
        }
        case MatchStatus.Complete: {
          console.warn("Unimplemented conversion!");
          card = <div className="p-5 bg-p-grey-100">Unimplemented</div>;
          break;
        }
        case MatchStatus.Request: {
          card = (
            <Proposal
              data={match}
              onAccept={() => {
                api.match().accept(match._id).then().catch(console.warn);
              }}
            />
          ) as ReactNode;
          break;
        }
      }
      return card;
    });
  }
}
