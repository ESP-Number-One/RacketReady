import type { Sport } from "@esp-group-one/types";
import { Tag } from "./tags";
import { Profile } from "./profile";

interface MatchCard {
  sportsTag: Sport;
  profilePic: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  link: string;
}

export function Match({
  sportsTag,
  profilePic,
  name,
  date,
  startTime,
  endTime,
  link,
}: MatchCard) {
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
        <div className="font-body text-white text-xl">{`${startTime} - ${endTime}`}</div>
        <div className="pb-1">
          <Tag sportName={sportsTag} />
        </div>
      </div>
      <div className="font-body font-bold text-base uppercase text-center pr-6 text-white">
        <div>{formatDate(date).weekday}</div>
        <div className="text-3xl">{formatDate(date).day}</div>
        <div>{formatDate(date).month}</div>
      </div>
    </a>
  );
}

function formatDate(date: string) {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "2-digit",
    month: "short",
  };

  const formattedDate = new Date(date);
  const weekday = formattedDate.toLocaleDateString("en-UK", {
    weekday: options.weekday,
  });
  const day = formattedDate.toLocaleDateString("en-UK", { day: options.day });
  const month = formattedDate.toLocaleDateString("en-UK", {
    month: options.month,
  });

  return { weekday, day, month };
}
