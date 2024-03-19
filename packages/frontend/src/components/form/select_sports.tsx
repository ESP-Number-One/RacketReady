import type { Sport } from "@esp-group-one/types";
import { useCallback } from "react";
import type { ChangeEvent } from "react";
import { twMerge } from "tailwind-merge";
import { sportToColour } from "../../../util/sport";

interface SportListProps {
  className?: string;
  onChange: (sport: Sport) => void;
  value: Sport | undefined;
  sports: Sport[];
  required?: boolean;
}

export function SelectSport({
  className = "",
  onChange,
  value,
  required = true,
  sports: sportsOptions,
}: SportListProps) {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const s = e.target.value as Sport;
      onChange(s);
    },
    [onChange],
  );

  return (
    <select
      className={twMerge(
        "hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg px-5 py-2.5 text-center inline-flex items-center w-full",
        "text-white font-body text-2xl font-bold",
        value ? sportToColour(value) : "bg-p-grey-100",
        className,
      )}
      value={value ?? ""}
      onChange={handleChange}
      required={required}
    >
      <option disabled value="">
        Choose a sport
      </option>
      {sportsOptions.map((option, index) => (
        <option
          className={twMerge(
            `text-white hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-body rounded-lg text-xl px-5 py-2.5 text-center inline-flex items-center`,
            sportToColour(option),
          )}
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
