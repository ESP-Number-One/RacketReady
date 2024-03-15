import { calculateAverageRating } from "@esp-group-one/types";
import type {
  CensoredUser,
  MatchProposal,
  SportInfo,
  StarCount,
} from "@esp-group-one/types";
import type { Moment } from "moment";
import { useState } from "react";
import moment from "moment";
import { ProfilePic } from "./profile_pic";
import { Stars } from "./stars";

interface Info {
  availability: Moment[];
  proposeMatch: (proposal: MatchProposal) => void;
  user: CensoredUser;
  sport: SportInfo;
}

export function RecProfile({ user, availability, sport, proposeMatch }: Info) {
  const name = user.name;
  const desc = user.description;
  const rating = calculateAverageRating(user.rating);
  const [availabilities, setAvailabilities] = useState(availability);

  return (
    <div className="h-fit max-h-fit mt-2 mb-2 snap-start">
      <div className="overflow-clip max-h-fit rounded-t-lg">
        <ProfilePic
          image={user.profilePicture}
          sports={[sport]}
          displayAbility={false}
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
            size="lg"
          />
        </div>
        <div
          className={
            availabilities.length > 0
              ? "max-w-full w-full text-white text-center max-h-fit overflow-clip font-body pb-3 px-5"
              : "max-w-full w-full text-white text-center max-h-fit overflow-clip font-body pb-3 px-5 rounded-b-lg"
          }
        >
          <p className="line-clamp-3">{desc}</p>
        </div>
      </div>
      {availabilities.length > 0 ? (
        <div className="bg-slate-400 px-5 pt-2 pb-2 mt-1 space-y-2 overflow-scroll rounded-b-lg">
          {availabilities.map((time, i) => {
            const endTime = time.clone();
            return (
              <button
                className="bg-slate-600 flex justify-between w-full text-white text-xl text-bold text-body px-5 pt-3 pb-3 rounded-lg"
                key={`${user._id.toString()}-${i}`}
                onClick={() => {
                  proposeMatch({
                    date: time.toISOString(),
                    to: user._id,
                    sport: sport.sport,
                  });
                  setAvailabilities(
                    availabilities.filter((t) => {
                      return t !== time;
                    }),
                  );
                }}
              >
                <p className="text-left">{`${time.format("hh:mm")}-${endTime
                  .add(1, "hours")
                  .format("hh:mm")}`}</p>
                <p className="text-right">
                  {/* eslint-disable-next-line import/no-named-as-default-member
                  -- using now is ambiguous */}
                  {moment(moment.now())
                    .add(1, "week")
                    .endOf("week")
                    .isBefore(endTime.clone().add(1, "week").endOf("week"))
                    ? time.format("D/M")
                    : time.format("dddd")}
                </p>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
