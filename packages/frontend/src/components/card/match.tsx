import {
  type CensoredUser,
  makeImgSrc,
  type Match,
} from "@esp-group-one/types";
import type { Moment } from "moment";
import moment from "moment";
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
  const op = opponent;
  const profilePic = makeImgSrc(op.profilePicture);

  const startTime = moment(date);
  const info = formatDate(startTime);
  const endinfo = formatDate(startTime.clone().add(1, "hour"));
  return (
    <a
      href={`/match/${matchId.toString()}`}
      className={`${className} rounded-lg border w-full border-gray-300 p-2 flex items-center bg-p-grey-200`}
    >
      <div className="mr-4">
        <div className="image-container">{<Profile imgSrc={profilePic} />}</div>
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
