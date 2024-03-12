import { MatchStatus } from "@esp-group-one/types";
import type { CensoredLeague, CensoredUser, Match } from "@esp-group-one/types";
import type { ReactNode } from "react";
import type { APIClient } from "@esp-group-one/api-client";
import moment from "moment";
import { Proposal } from "../components/proposal";
import { RecProfile } from "../components/rec_profile";

export namespace Cards {
  export function fromUsers(users: CensoredUser[], api: APIClient) {
    return Promise.all(
      (() => {
        return users.map(async (user) => {
          return (
            <RecProfile
              key={user._id.toString()}
              user={user}
              profilePicture={await api.user().getProfileSrc(user._id)}
              availability={(
                await api.user().findAvailabilityWith(user._id, {})
              ).map((time) => {
                return moment(time);
              })}
              displayAbility={false}
            />
          );
        });
      })(),
    ).then((cards) => {
      return cards;
    });
  }

  export function fromLeagues(leagues: CensoredLeague[], _api: APIClient) {
    console.error("Not implemented");
    return leagues.map((league) => {
      return (<div key={league._id.toString()} />) as ReactNode;
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
