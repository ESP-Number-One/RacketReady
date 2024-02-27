import type { Sport } from "@esp-group-one/types";
import type { Moment } from "moment";
import { Tag } from "./tags";
import { Profile } from "./profile";

interface MatchCardProps {
  sportsTag: Sport;
  profilePic: string;
  name: string;
  startTime: Moment;
  endTime: Moment;
  link: string;
}

export function MatchCard({
  sportsTag,
  profilePic,
  name,
  startTime,
  endTime,
  link,
}: MatchCardProps) {
  const info = formatDate(startTime);
  const endinfo = formatDate(endTime);
  return (
    <a
      href={link}
      className="rounded-lg border border-gray-300 p-2 flex items-center w-80 bg-p-grey-200"
    >
      <div className="mr-4">
        <div className="image-container">
          <Profile imgSrc={profilePic} />
        </div>
      </div>
      <div className="flex flex-col flex-1">
        <div className="font-title font-bold text-2xl text-white">{name}</div>
        <div className="font-body text-white text-xl">{`${info.time} - ${endinfo.time}`}</div>
        <div className="pb-1">
          <Tag sportName={sportsTag} />
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
