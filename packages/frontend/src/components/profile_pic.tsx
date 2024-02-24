import type { Sport } from "@esp-group-one/types";
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

export function ProfilePic({ sports }: SportInfo) {
  const handleClick = (clickedIndex: number) => {
    const updatedData = sports.map((item, index) => ({
      ...item,
      selected: index === clickedIndex,
    }));

    console.log(updatedData);
  };

  return (
    <div className="w-full aspect-square relative">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Cat_August_2010-4.jpg/1200px-Cat_August_2010-4.jpg"
        alt="Italian Trulli"
      />
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
      <div className="bg-beginner font-title text-white py-3 px-5 text-center text-xl font-bold">
        Beginner
      </div>
    </div>
  );
}
