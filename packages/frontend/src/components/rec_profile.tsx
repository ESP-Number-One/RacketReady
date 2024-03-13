import { calculateAverageRating } from "@esp-group-one/types";
import type {
  CensoredUser,
  DateTimeString,
  ObjectId,
  Sport,
  StarCount,
} from "@esp-group-one/types";
import type { Moment } from "moment";
import { ProfilePic } from "./profile_pic";
import { Stars } from "./stars";

interface Info {
  user: CensoredUser;
  availability: Moment[];
  proposeMatch: (date: DateTimeString, to: ObjectId, sport: Sport) => void;
  displayAbility: boolean;
}

export function RecProfile({
  user,
  availability,
  displayAbility,
  proposeMatch,
}: Info) {
  const sports = user.sports;
  const name = user.name;
  const desc = user.description;
  const rating = calculateAverageRating(user.rating);

  return (
    <div className="h-fit max-h-fit mt-2 mb-2 snap-start">
      <div className="overflow-clip max-h-fit rounded-t-lg">
        <ProfilePic
          image={user.profilePicture}
          sports={sports.slice(0, 1)}
          displayAbility={displayAbility}
        />
      </div>
      <div className="bg-slate-400 overflow-hidden">
        <h1 className="text-white font-title font-bold text-right px-5 text-3xl pt-3">
          {name}
        </h1>
        <div className="flex flex-row-reverse p-2">
          <Stars
            rating={Math.min(5, Math.max(1, Math.floor(rating))) as StarCount}
            disabled={true}
          />
        </div>
        <div
          className={
            availability.length > 0
              ? "max-w-full w-full text-white text-center max-h-fit overflow-clip font-body pb-3 px-5"
              : "max-w-full w-full text-white text-center max-h-fit overflow-clip font-body pb-3 px-5 rounded-b-lg"
          }
        >
          <p className="line-clamp-3">{desc}</p>
        </div>
      </div>
      {availability.length > 0 ? (
        <div className="bg-slate-400 px-5 pt-2 pb-2 mt-1 space-y-2 overflow-scroll rounded-b-lg">
          {availability.map((time, i) => {
            return (
              <button
                className="bg-slate-600 flex justify-between text-white text-xl text-bold text-body px-5 pt-3 pb-3 rounded-lg"
                key={`${user._id.toString()}-${i}`}
                onClick={() => {
                  proposeMatch(time.toISOString(), user._id, sports[0].sport);
                }}
              >
                <p className="text-left">{`${time.format("hh:mm")}-${time
                  .add(1, "hours")
                  .format("hh:mm")}`}</p>
                <p className="text-right">{time.format("dddd")}</p>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
