import {
  type CensoredUser,
  makeImgSrc,
  type Match,
} from "@esp-group-one/types";
import type { Moment } from "moment";
import moment from "moment";
import { twMerge } from "tailwind-merge";
import { Profile } from "../profile";
import { Tag } from "../tags";
import { Link } from "../link";

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
    <Link
      href={`/match?id=${matchId.toString()}`}
      className={twMerge(
        "rounded-lg border w-full border-gray-300 p-2 flex items-center bg-p-grey-200",
        className,
      )}
    >
      <div className="mr-4">
        <div className="image-container">
          <Profile imgSrc={profilePic} />
        </div>
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
      <div className="font-body font-bold text-base uppercase text-center pr-2 text-white">
        <div className="leading-none">{info.weekday}</div>
        <div className="text-3xl leading-none">{info.day}</div>
        <div className="leading-none">{info.month}</div>
      </div>
    </Link>
  );
}

function formatDate(startTime: Moment) {
  const weekday = startTime.format("ddd");
  const day = startTime.format("D");
  const month = startTime.format("MMM");
  const time = startTime.format("HH:mm");
  return { weekday, day, month, time };
}
