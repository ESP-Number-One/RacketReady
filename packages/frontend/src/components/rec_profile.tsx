import { calculateAverageRating } from "@esp-group-one/types";
import type { CensoredUser } from "@esp-group-one/types";
import moment from "moment";
import { ProfilePic } from "./profile_pic";
import { Stars } from "./stars";

interface Info {
  user: CensoredUser;
  pfp: string;
  availability: string[];
  displayAbility: boolean;
}

export function RecProfile({ user, pfp, availability, displayAbility }: Info) {
  const sports = user.sports;
  const name = user.name;
  const desc = user.description;
  const rating = calculateAverageRating(user.rating);

  return (
    <div className="h-fit max-h-fit mt-2 mb-2 snap-start">
      <div className="overflow-clip max-h-fit rounded-t-lg">
        <ProfilePic
          image={pfp}
          sports={sports}
          displayAbility={displayAbility}
        />
      </div>
      <div className="bg-slate-400 overflow-hidden">
        <h1 className="text-white font-title font-bold text-right px-5 text-3xl pt-3">
          {name}
        </h1>
        <div className="flex flex-row-reverse p-2">
          <Stars rating={rating} />
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
              <div
                className="bg-slate-600 flex justify-between text-white text-xl text-bold text-body px-5 pt-3 pb-3 rounded-lg"
                key={`${user._id.toString()}-${i}`}
              >
                <p className="text-left">{`${moment(time).format(
                  "hh:mm",
                )}-${moment(time).add(1, "hours").format("hh:mm")}`}</p>
                <p className="text-right">{moment(time).format("dddd")}</p>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
