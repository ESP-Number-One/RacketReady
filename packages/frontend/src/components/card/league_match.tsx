import {
  type CensoredUser,
  type Match,
  MatchStatus,
} from "@esp-group-one/types";
import moment from "moment";

export function LeagueMatch({
  match,
  players,
}: {
  match: Match;
  players: Record<string, CensoredUser>;
}) {
  if (match.status === MatchStatus.Complete) {
    // TODO: Scoring stuff.
  }

  console.log({ match });

  const player1 = players[match.players[0].toString()];
  const player2 = players[match.players[1].toString()];
  const date = moment(match.date);
  return (
    <div className="league-match grid grid-cols-[1fr_max-content] grid-rows-[1fr_max-content_1fr] bg-p-grey-200 text-white rounded-xl">
      <div className="col-start-1 col-end-2 row-start-1 row-end-2 font-title text-3xl font-bold px-3 pt-1">
        {player1.name}
      </div>
      <div className="col-start-1 col-end-2 row-start-3 row-end-4 font-title text-3xl font-bold px-3 pb-1">
        {player2.name}
      </div>
      <div className="divider col-start-1 col-end-2 flex row-start-2 row-end-3 w-full items-center">
        <div className="block h-[2px] bg-white grow" />
        <div className="mx-4 font-title tracking-widest font-bold leading-none">
          vs
        </div>
        <div className="block h-[2px] bg-white grow" />
      </div>
      <div className="col-start-2 col-end-3 row-start-1 row-end-4 self-center m-2 flex flex-col uppercase leading-none font-bold">
        <div>{date.format("ddd")}</div>
        <div className="text-3xl">{date.format("DD")}</div>
        <div>{date.format("MMM")}</div>
      </div>
    </div>
  );
}
