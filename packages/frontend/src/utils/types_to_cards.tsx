import {
  MatchStatus,
  type CensoredUser,
  type League,
  type Match,
  type User,
} from "@esp-group-one/types";
import type { ReactNode } from "react";
import type { APIClient } from "@esp-group-one/api-client";
import { Proposal } from "../components/proposal";

export namespace Cards {
  export function fromUsers(users: User[] | CensoredUser[]) {
    console.error("Not implemented");
    return users.map((user) => {
      return (<div key={user._id.toString()} />) as ReactNode;
    });
  }

  export function fromLeagues(leagues: League[]) {
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
