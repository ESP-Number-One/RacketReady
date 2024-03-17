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
  console.log({ match });

  const player1 = players[match.players[0].toString()];
  const player2 = players[match.players[1].toString()];
  const date = moment(match.date);
  return (
    <div className="league-match grid grid-cols-[max-content_1fr_max-content] grid-rows-[1fr_max-content_1fr] bg-p-grey-200 text-white rounded-xl overflow-clip mb-2">
      <div className="col-start-2 col-end-3 row-start-1 row-end-2 font-title text-3xl font-bold px-3 pt-1 self-center">
        {player1.name}
      </div>
      <div className="col-start-2 col-end-3 row-start-3 row-end-4 font-title text-3xl font-bold px-3 pb-1 self-center">
        {player2.name}
      </div>
      <div className="divider col-start-2 col-end-4 flex row-start-2 row-end-3 w-full items-center">
        <div className="block h-[2px] bg-white grow" />
        <div className="mx-4 font-title tracking-widest font-bold leading-[0]">
          vs
        </div>
        <div className="block h-[2px] bg-white grow" />
      </div>
      <div className="col-start-1 col-end-2 row-start-1 row-end-4 p-2 px-2 my-auto flex flex-col uppercase leading-none font-bold items-center">
        <div>{date.format("ddd")}</div>
        <div className="text-3xl">{date.format("DD")}</div>
        <div>{date.format("MMM")}</div>
      </div>
      {match.status === MatchStatus.Complete ? (
        <>
          <div
            className={`col-start-3 col-end-4 row-start-1 row-end-2 p-2 px-4 text-3xl font-bold font-title flex justify-center items-end ${
              match.score[player1._id.toString()] >
              match.score[player2._id.toString()]
                ? "bg-p-green-100"
                : ""
            }`}
          >
            {match.score[player1._id.toString()]}
          </div>
          <div
            className={`col-start-3 col-end-4 row-start-3 row-end-4 p-2 px-4 text-3xl font-bold font-title flex justify-center items-end ${
              match.score[player2._id.toString()] >
              match.score[player1._id.toString()]
                ? "bg-p-green-100"
                : ""
            }`}
          >
            {match.score[player2._id.toString()]}
          </div>
        </>
      ) : null}
    </div>
  );
}
