import type { CensoredUser, League, Match, User } from "@esp-group-one/types";

export function users2Cards(users: User[] | CensoredUser[]) {
  console.log("Not implemented");
  return users.map((_user, _idx, _arr) => {
    return <div key={_user._id.toHexString()} />;
  });
}

export function leagues2Cards(leagues: League[]) {
  console.log("Not implemented");
  return leagues.map((_league, _idx, _arr) => {
    return <div key={_league._id.toHexString()} />;
  });
}
export function match2Cards(matches: Match[]) {
  console.log("Not implemented");
  return matches.map((_match, _idx, _arr) => {
    return <div key={_match._id.toHexString()} />;
  });
}
