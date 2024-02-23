import type { CensoredUser, League, Match, User } from "@esp-group-one/types";

export module Cards {
  export function fromUsers(users: User[] | CensoredUser[]) {
    console.error("Not implemented");
    return users.map((user, _idx, _arr) => {
      return <div key={user._id.toHexString()} />;
    });
  }

  export function fromLeagues(leagues: League[]) {
    console.error("Not implemented");
    return leagues.map((league, _idx, _arr) => {
      return <div key={league._id.toHexString()} />;
    });
  }
  export function fromMatches(matches: Match[]) {
    console.error("Not implemented");
    return matches.map((match, _idx, _arr) => {
      return <div key={match._id.toHexString()} />;
    });
  }
}
