import type { Sport } from "@esp-group-one/types";
import { useState } from "react";
import type { ChangeEvent } from "react";
import { sportToColour } from "../../util/sport";

interface SportListProps {
  sports: Sport[];
}

export function SelectSport({
  sports: sportsOptions,
  currentSport,
}: SportListProps & { currentSport: Sport }) {
  const [sport, setSport] = useState(currentSport.toString());

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSport(e.target.value);
  };

  return (
    <div>
      <select
        className={`text-white ${sportToColour(
          sport,
        )} hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-body rounded-lg text-lg px-5 py-2.5 text-center inline-flex items-center w-full`}
        value={sport}
        id="dropdown"
        onChange={(e) => {
          handleChange(e);
        }}
      >
        {sportsOptions.map((option, index) => (
          <option
            className={`text-white ${sportToColour(
              option.toString(),
            )} hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-body rounded-lg text-xl px-5 py-2.5 text-center inline-flex items-center`}
            key={index}
            value={option.toString()}
          >
            {option.toString().charAt(0).toUpperCase() +
              option.toString().slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
