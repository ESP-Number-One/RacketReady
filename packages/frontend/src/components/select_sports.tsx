import { Sport } from "@esp-group-one/types";
import { useState } from "react";
import type { ChangeEvent } from "react";

export function SelectSport() {
  const [sport, setSport] = useState("Tennis");
  const [colour, setColour] = useState("tennis");

  const options = [
    { colour: "tennis", label: "Tennis" },
    { colour: "badminton", label: "Badminton" },
    { colour: "squash", label: "Squash" },
  ];

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSport(e.target.value);
    if (e.target.value === "Tennis") {
      setColour("tennis");
    } else if (e.target.value === "Badminton") {
      setColour("badminton");
    } else {
      setColour("squash");
    }
  };

  return (
    <div>
      <select
        className={`text-white bg-${colour} hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-body rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center w-full`}
        value={sport}
        id="dropdown"
        onChange={(e) => {
          handleChange(e);
        }}
      >
        {options.map((option, index) => (
          <option
            className={`text-white ${getColour(
              option.colour as Sport,
            )} hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-body rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center" type="button">Dropdown button <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6`}
            key={index}
            value={option.label}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function getColour(sport: Sport) {
  switch (sport) {
    case Sport.Badminton:
      return "bg-badminton";
    case Sport.Squash:
      return "bg-squash";
    case Sport.Tennis:
      return "bg-tennis";
  }
}
