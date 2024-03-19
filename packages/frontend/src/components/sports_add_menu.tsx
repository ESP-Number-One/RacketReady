import type { SportInfo } from "@esp-group-one/types";
import { AbilityLevel, Sport } from "@esp-group-one/types";
import { useCallback } from "react";
import { twMerge } from "tailwind-merge";
import { abilityToColour } from "../../util/sport";
import { SelectSport } from "./form/select_sports";

interface SportsAddMenuProps {
  sports: SportInfo[];
  setSports: (s: SportInfo[]) => void;
}

export function SportsAddMenu({ sports, setSports }: SportsAddMenuProps) {
  const allSports = Object.values(Sport) as Sport[];
  const allAbilities = Object.values(AbilityLevel) as AbilityLevel[];

  const pickedSports = sports.map((info) => info.sport);
  const unpickedSports = allSports.filter((s) => !pickedSports.includes(s));

  const updateSports = useCallback(
    (i: number, value: SportInfo) => {
      sports[i] = value;
      setSports([...sports]);
    },
    [sports, setSports],
  );

  return (
    <div>
      {sports.map((info, i) => (
        <div key={info.sport}>
          <div>
            <SelectSport
              className="mt-2"
              onChange={(sport) => {
                updateSports(i, { ...info, sport });
              }}
              sports={[info.sport, ...unpickedSports]}
              value={info.sport}
            />
          </div>
          <select
            className={twMerge(
              `text-white font-body mt-2 text-2xl font-bold`,
              (info.ability as unknown)
                ? abilityToColour(info.ability)
                : "bg-p-grey-200",
              `hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg px-5 py-2.5 text-center inline-flex items-center w-full`,
            )}
            onChange={(e) => {
              updateSports(i, {
                ...info,
                ability: e.target.value as AbilityLevel,
              });
            }}
            value={(info.ability as string | undefined) ?? ""}
            required
          >
            <option disabled value="">
              What level are you?
            </option>
            {allAbilities.map((a) => (
              <option value={a} key={`${info.sport}_${a}`}>
                {a.toString().charAt(0).toUpperCase() + a.toString().slice(1)}
              </option>
            ))}
          </select>
          <hr className="w-full h-1 bg-black rounded-full mt-2" />
        </div>
      ))}

      {unpickedSports.length > 0 && (
        <>
          <SelectSport
            className="mt-2"
            onChange={(sport) => {
              sports.push({
                sport,
                ability: undefined as unknown as AbilityLevel,
              });
              setSports([...sports]);
            }}
            sports={unpickedSports}
            value={undefined}
            required={sports.length === 0}
          />
        </>
      )}
    </div>
  );
}
