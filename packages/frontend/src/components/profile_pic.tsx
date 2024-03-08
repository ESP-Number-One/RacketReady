import { AbilityLevel, type Sport, type SportInfo } from "@esp-group-one/types";
import { useMemo, useState } from "react";
import { Tag } from "./tags";

interface Info {
  sports: SportInfo[];
  image: string;
  displayAbility?: boolean;
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
  const selectedSport = sports.find((sport) => sport.sport === selected);

  return selectedSport ? selectedSport.ability : AbilityLevel.Beginner;
}

export function ProfilePic({
  sports: initialSports,
  image,
  displayAbility = true,
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
        <div className="h-min absolute bottom-0 left-0 bottom-0 p-2">
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
          className={`${colour} font-title text-white py-3 px-5 text-center text-xl font-bold`}
        >
          {ability.charAt(0).toUpperCase() + ability.slice(1)}
        </div>
      )}
    </div>
  );
}
