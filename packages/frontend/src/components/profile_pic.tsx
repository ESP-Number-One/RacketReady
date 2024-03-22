import { AbilityLevel, type Sport, type SportInfo } from "@esp-group-one/types";
import { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Tag } from "./tags";

interface Info {
  displayAbility?: boolean;
  image: string;
  sports: SportInfo[];
}

function getAbilityColour(abilityLevel: AbilityLevel) {
  switch (abilityLevel) {
    case AbilityLevel.Beginner:
      return "bg-beginner";
    case AbilityLevel.Intermediate:
      return "bg-intermediate";
    case AbilityLevel.Advanced:
      return "bg-advanced";
  }
}

function getAbilityLevel(sports: SportInfo[], selected: Sport): AbilityLevel {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- cannot be called without it existing
  const selectedSport = sports.find((sport) => sport.sport === selected)!;

  return selectedSport.ability;
}

export function ProfilePic({
  displayAbility = true,
  image,
  sports: initialSports,
}: Info) {
  const [selectedSport, setSelectedSport] = useState(initialSports[0].sport);

  const ability = useMemo(
    () => getAbilityLevel(initialSports, selectedSport),
    [initialSports, selectedSport],
  );
  const colour = useMemo(() => getAbilityColour(ability), [ability]);

  const handleClick = (sport: Sport) => {
    setSelectedSport(sport);
  };

  return (
    <div className="w-full">
      <div className="relative aspect-square">
        <img src={image} className="w-full" />
        <div className="h-min absolute left-0 bottom-0 p-2">
          <div className="flex flex-wrap items-center gap-2">
            {initialSports.map((sport) => (
              <button
                onClick={() => {
                  handleClick(sport.sport);
                }}
                key={sport.sport}
              >
                <Tag
                  sportName={sport.sport}
                  active={sport.sport === selectedSport}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
      {displayAbility && (
        <div
          className={twMerge(
            `font-title text-white py-3 px-5 text-center text-xl font-bold`,
            colour,
          )}
        >
          {ability.charAt(0).toUpperCase() + ability.slice(1)}
        </div>
      )}
    </div>
  );
}
