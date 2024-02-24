import type { Sport } from "@esp-group-one/types";
import { useState } from "react";
import { useEffect } from "react";
import { Tag } from "./tags";

interface Info {
  sportName: Sport;
  selected: boolean;
  abilityLevel: string;
  onClick: () => void;
}

interface SportInfo {
  sports: Info[];
}

const getAbilityLevel = (sports: Info[]): string => {
  const selectedSport = sports.find((sport) => sport.selected);

  return selectedSport ? selectedSport.abilityLevel : "Beginner";
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
  image,
}: SportInfo & { image: string }) {
  const [sports, setSports] = useState<Info[]>(initialSports);
  const [ability, setAbility] = useState(getAbilityLevel(sports));

  useEffect(() => {
    setAbility(getAbilityLevel(sports));
  }, [sports]);

  const handleClick = (clickedIndex: number) => {
    const updatedData = sports.map((item, index) => ({
      ...item,
      selected: index === clickedIndex,
    }));

    setSports(updatedData);
  };

  return (
    <div className="w-full aspect-square relative">
      <img src={image} />
      <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-wrap items-center gap-4 p-2">
        {sports.map((sport, index) => (
          <Tag
            sportName={sport.sportName}
            active={sport.selected}
            key={index}
            onClick={() => {
              handleClick(index);
            }}
          />
        ))}
      </div>
      <div
        className={`${getAbilityColour(
          ability,
        )} font-title text-white py-3 px-5 text-center text-xl font-bold`}
      >
        {getAbilityLevel(sports)}
      </div>
    </div>
  );
}
