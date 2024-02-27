import type { Sport, SportInfo } from "@esp-group-one/types";
import { ProfilePic } from "./profile_pic";

const handleClick = () => {
  console.log("");
};

interface Info {
  sports: SportInfo[];
  onClick: () => void;
  selected: Sport;
  image: string;
  displayAbility: boolean;
}

export function RecProfile({
  sports: initialSports,
  selected,
  image,
  displayAbility,
}: Info) {
  return (
    <div>
      <ProfilePic
        image={image}
        sports={initialSports}
        selected={selected}
        onClick={() => {
          handleClick();
        }}
        displayAbility={displayAbility}
      />
      <div className="bg-slate-400">
        <h1 className="text-white font-title font-bold text-right px-5 text-3xl pt-3">
          {"Hugo Whittome"}
        </h1>
        <p className="text-white text-center text-body pb-3 px-5">
          {
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud"
          }
        </p>
      </div>
      <div className="bg-slate-400 px-5 pb-3 space-y-2">
        <div className="bg-slate-600 flex justify-between text-white text-xl text-bold text-body px-5 pt-3 pb-3 rounded-lg">
          <p className="text-left">16:15-17:15</p>
          <p className="text-right">Friday</p>
        </div>
        <div className="bg-slate-600 flex justify-between text-white text-xl text-bold text-body px-5 pt-3 pb-3 rounded-lg">
          <p className="text-left">16:15-17:15</p>
          <p className="text-right">Friday</p>
        </div>
      </div>
    </div>
  );
}
