import type { CensoredUser, League, Match, User } from "@esp-group-one/types";

/* eslint-disable-next-line @typescript-eslint/no-namespace -- Using namespaces to improve readability
 */
export namespace Cards {
  export function fromUsers(users: User[] | CensoredUser[]) {
    console.error("Not implemented");
    return users.map((user, _idx, _arr) => {
      return <div key={user._id.toString()} />;
    });
  }

  export function fromLeagues(leagues: League[]) {
    console.error("Not implemented");
    return leagues.map((league, _idx, _arr) => {
      return <div key={league._id.toString()} />;
    });
  }
  export function fromMatches(matches: Match[]) {
    console.error("Not implemented");
    return matches.map((match, _idx, _arr) => {
      return <div key={match._id.toHexString()} />;
    });
  }
}
