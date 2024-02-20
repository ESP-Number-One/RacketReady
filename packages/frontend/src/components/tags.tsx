import { Sport } from "@esp-group-one/types";

interface Tagging {
  sportName: Sport;
}

export function Tag({ sportName }: Tagging) {
  return (
    <div
      className={`inline-block rounded-full py-1 px-5 font-bold font-title text-white text-md ${getSportColorClass(
        sportName,
      )}`}
    >
      {sportName.charAt(0).toUpperCase() + sportName.slice(1)}
    </div>
  );
}

function getSportColorClass(sportName: Sport) {
  switch (sportName) {
    case Sport.Badminton:
      return "bg-badminton";
    case Sport.Tennis:
      return "bg-tennis";
    case Sport.Squash:
      return "bg-squash";
  }
}
