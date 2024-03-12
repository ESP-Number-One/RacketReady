import { makeWebP, type Match, type ObjectId } from "@esp-group-one/types";
import type { Moment } from "moment";
import { useContext, type JSX } from "react";
import moment from "moment";
import { API } from "../../state/auth";
import { ErrorHandler, useAsync } from "../../lib/async";
import { Profile } from "../profile";
import { Tag } from "../tags";

export function MatchCard({
  className = "",
  match: { sport, date, _id: matchId },
  opponent,
}: {
  className?: string;
  match: Match;
  opponent: CensoredUser;
}) {
  const api = useContext(API);
  const errorHandler = useContext(ErrorHandler);

  const { ok, loading, error } = useAsync(async () => {
    const { _id: myId } = await api.user().me();

    const opId = players.find(
      (id) => id.toString() !== myId.toString(),
    ) as unknown as ObjectId;

    const op = await api.user().getId(opId);
    const profilePic = await api
      .user()
      .getId(opId)
      .then((u) => makeWebP(u.profilePicture));

    return { profilePic };
  })
    .catch(errorHandler)
    .await();

  if (error) return error as JSX.Element;

  const startTime = moment(date);
  const info = formatDate(startTime);
  const endinfo = formatDate(startTime.clone().add(1, "hour"));
  return (
    <a
      href={`/match/${matchId.toString()}`}
      className="rounded-lg border w-full border-gray-300 p-2 flex items-center bg-p-grey-200"
    >
      <div className="mr-4">
        {ok ? (
          <div className="image-container">
            <Profile imgSrc={ok.profilePic} />
          </div>
        ) : (
          <div className="flex place-content-center w-24 h-24 rounded-2xl overflow-hidden">
            {loading}
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1">
        <div className="font-title font-bold text-2xl text-white">
          {opponent.name}
        </div>
        <div className="font-body text-white text-xl">{`${info.time} - ${endinfo.time}`}</div>
        <div className="pb-1">
          <Tag sportName={sport} />
        </div>
      </div>
      <div className="font-body font-bold text-base uppercase text-center pr-6 text-white">
        <div>{info.weekday}</div>
        <div className="text-3xl">{info.day}</div>
        <div>{info.month}</div>
      </div>
    </a>
  );
}

function formatDate(startTime: Moment) {
  const weekday = startTime.format("ddd");
  const day = startTime.format("D");
  const month = startTime.format("MMM");
  const time = startTime.format("HH:mm");
  return { weekday, day, month, time };
}
