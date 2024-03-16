import { AbilityLevel } from "@esp-group-one/types";
import type {
  CensoredLeague,
  MatchProposal,
  UserMatchReturn,
} from "@esp-group-one/types";
import type { ReactNode } from "react";
import type { APIClient } from "@esp-group-one/api-client";
import moment from "moment";
import { RecProfile } from "../components/rec_profile";
import { LeagueCard } from "../components/card/league";

export namespace Cards {
  export async function fromRecommendedUsers(
    users: UserMatchReturn,
    api: APIClient,
  ) {
    return Promise.all(
      (() => {
        return users.map(async (user) => {
          return (
            <RecProfile
              key={`${user.u._id.toString()}-${user.sport}`}
              user={user.u}
              availability={(
                await api.user().findAvailabilityWith(user.u._id, {})
              ).map((time) => {
                return moment(time);
              })}
              sport={{ sport: user.sport, ability: AbilityLevel.Beginner }}
              proposeMatch={(proposal: MatchProposal) => {
                api.match().create(proposal).then().catch(console.warn);
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
      return (<LeagueCard className="mt-2" data={league} />) as ReactNode;
    });
  }
}
