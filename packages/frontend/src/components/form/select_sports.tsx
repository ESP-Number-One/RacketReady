import type { Sport } from "@esp-group-one/types";
import { useCallback, useState } from "react";
import type { ChangeEvent } from "react";
import { sportToColour } from "../../../util/sport";

interface SportListProps {
  sports: Sport[];
  currentSport: Sport;
}

export function SelectSport({
  sports: sportsOptions,
  currentSport,
}: SportListProps) {
  const [sport, setSport] = useState(currentSport);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setSport(e.target.value as Sport);
    },
    [setSport],
  );

  return (
    <select
      className={`text-white ${sportToColour(
        sport,
      )} hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-body rounded-lg text-lg px-5 py-2.5 text-center inline-flex items-center w-full`}
      value={sport}
      onChange={handleChange}
    >
      {sportsOptions.map((option, index) => (
        <option
          className={`text-white ${sportToColour(
            option,
          )} hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-body rounded-lg text-xl px-5 py-2.5 text-center inline-flex items-center`}
          key={index}
          value={option.toString()}
        >
          {option.toString().charAt(0).toUpperCase() +
            option.toString().slice(1)}
        </option>
      ))}
    </select>
  );
}
