import type { Sport, SportInfo } from "@esp-group-one/types";
import { useMemo, useState } from "react";
import { Tag } from "./tags";

interface Info {
  sports: SportInfo[];
  onClick: () => void;
  selected: Sport;
}

const getAbilityLevel = (sports: SportInfo[], selected: Sport): string => {
  const selectedSport = sports.find((sport) => sport.sport === selected);
  console.log(selectedSport ? selectedSport.ability : "Beginner");

  return selectedSport ? selectedSport.ability : "Beginner";
};

function getAbilityColour(abilityLevel: string) {
  switch (abilityLevel) {
    case "Beginner":
      return "bg-beginner";
    case "Intermediate":
      return "bg-intermediate";
    case "Advanced":
      return "bg-advanced";
  }
}

export function ProfilePic({
  sports: initialSports,
  selected,
  image,
}: Info & { image: string }) {
  const [selectedSport, setSelectedSport] = useState(selected);

  const ability = useMemo(
    () => getAbilityLevel(initialSports, selectedSport),
    [initialSports, selectedSport],
  );
  const colour = useMemo(() => getAbilityColour(ability), [ability]);

  const handleClick = (sport: Sport) => {
    setSelectedSport(sport);
  };

  return (
    <div className="w-full aspect-square relative">
      <img src={image} />
      <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-wrap items-center gap-4 p-2">
        {initialSports.map((sport, index) => (
          <Tag
            sportName={sport.sport}
            active={sport.sport === selectedSport}
            key={index}
            onClick={() => {
              handleClick(sport.sport);
            }}
          />
        ))}
      </div>
      <div
        className={`${colour} font-title text-white py-3 px-5 text-center text-xl font-bold`}
      >
        {getAbilityLevel(initialSports, selectedSport)}
      </div>
    </div>
  );
}
