import type { Sport } from "@esp-group-one/types";
import { useCallback, useState } from "react";
import type { ChangeEvent } from "react";
import { sportToColour } from "../../../util/sport";

interface SportListProps {
  className?: string;
  onChange: (sport: Sport) => void;
  sports: Sport[];
}

export function SelectSport({
  className = "",
  onChange,
  sports: sportsOptions,
}: SportListProps) {
  const [sport, setSport] = useState<Sport | undefined>();

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const s = e.target.value as Sport;
      setSport(s);
      onChange(s);
    },
    [setSport],
  );

  return (
    <select
      className={`${className} text-white font-body text-2xl font-bold ${
        sport ? sportToColour(sport) : "bg-p-grey-100"
      } hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg px-5 py-2.5 text-center inline-flex items-center w-full`}
      value={sport}
      onChange={handleChange}
      required
    >
      <option disabled selected={!sport}>
        Choose a sport
      </option>
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
