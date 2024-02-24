import { Sport } from "@esp-group-one/types";

interface Tagging {
  sportName: Sport;
  active: boolean;
  onClick: () => void;
}

export function Tag({ sportName, active, onClick }: Tagging) {
  return (
    <div
      className={`inline-block rounded-full py-1 px-5 font-bold font-title text-white text-md ${getSportColorClass(
        sportName,
        active,
      )}`}
      onClick={onClick}
    >
      {sportName.charAt(0).toUpperCase() + sportName.slice(1)}
    </div>
  );
}

function getSportColorClass(sportName: Sport, active: boolean) {
  if (!active) {
    return "bg-slate-600";
  }
  switch (sportName) {
    case Sport.Badminton:
      return "bg-badminton";
    case Sport.Tennis:
      return "bg-tennis";
    case Sport.Squash:
      return "bg-squash";
  }
}
