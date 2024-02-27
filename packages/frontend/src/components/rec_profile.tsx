import { ProfilePic } from "./profile_pic";
import type { Sport } from "@esp-group-one/types";

export function RecProfile() {
  return (
    <div>
      <ProfilePic
        image={
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Cat_August_2010-4.jpg/1200px-Cat_August_2010-4.jpg"
        }
        sports={[
          { sport: Sport.Tennis, ability: "Beginner" },
          { sport: Sport.Badminton, ability: "Intermediate" },
        ]}
        selected={Sport.Tennis}
        onClick={() => }
        displayAbility={false}
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
