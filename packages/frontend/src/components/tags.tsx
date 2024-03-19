import { Sport } from "@esp-group-one/types";
import { twMerge } from "tailwind-merge";

interface Tagging {
  active?: boolean;
  sportName: Sport;
  textSize?: string;
}

export function Tag({ active, sportName, textSize }: Tagging) {
  return (
    <div
      className={twMerge(
        "inline-block rounded-full py-1 px-5 font-bold font-title text-white",
        textSize ?? "text-md",
        getSportColorClass(sportName, active),
      )}
    >
      {sportName.charAt(0).toUpperCase() + sportName.slice(1)}
    </div>
  );
}

function getSportColorClass(sportName: Sport, active = true) {
  if (!active) return "bg-slate-600";

  switch (sportName) {
    case Sport.Badminton:
      return "bg-badminton";
    case Sport.Tennis:
      return "bg-tennis";
    case Sport.Squash:
      return "bg-squash";
  }
}
