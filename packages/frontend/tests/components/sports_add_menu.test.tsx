import type { SportInfo } from "@esp-group-one/types";
import { AbilityLevel, Sport } from "@esp-group-one/types";
import { cleanup, render } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { compareBag } from "@esp-group-one/test-helpers-base";
import { useState } from "react";
import { SportsAddMenu } from "../../src/components/sports_add_menu";

afterAll(cleanup);

describe("sports add menu", () => {
  describe("Stages", () => {
    const allSports: SportInfo[] = [
      {
        sport: Sport.Tennis,
        ability: AbilityLevel.Beginner,
      },
      {
        sport: Sport.Squash,
        ability: AbilityLevel.Intermediate,
      },
      {
        sport: Sport.Badminton,
        ability: AbilityLevel.Advanced,
      },
    ];

    for (let i = 0; i <= allSports.length; i++) {
      test(`With ${i} sports`, () => {
        const notIncludedSports = allSports.slice(i);

        const component = render(
          <SportsAddMenu
            sports={allSports.slice(0, i)}
            setSports={() => void 0}
          />,
        );

        expect(component.container).toBeInTheDocument();
        const menu = component.container.children[0];
        expect(menu.children.length).toBe(i + (i === allSports.length ? 0 : 1));
        expect(menu.querySelectorAll("hr").length).toBe(i);
        for (let j = 0; j < i; j++) {
          const sportsDiv = menu.children[j];
          expect(
            sportsDiv.children[1].classList.contains(
              `bg-${allSports[j].ability}`,
            ),
          );

          // Check the current sport is selected
          const sportsSelect = sportsDiv.children[0].querySelector("select");
          expect(sportsSelect).not.toBeNull();
          expect(sportsSelect?.value).toBe(allSports[j].sport);

          // Check the options are correct
          const sportOpts = [
            ...sportsDiv.children[0].querySelectorAll("option"),
          ];
          compareBag(
            sportOpts.map((o) => o.value),
            ["", allSports[j].sport, ...notIncludedSports.map((e) => e.sport)],
            (a, b) => a.localeCompare(b),
          );
        }

        if (i !== allSports.length) {
          const sportsSelect = menu.children[i] as HTMLSelectElement;
          expect(sportsSelect).not.toBeNull();
          expect(sportsSelect.value).toBe("");

          const sportOpts = [...sportsSelect.querySelectorAll("option")];
          compareBag(
            sportOpts.map((o) => o.value),
            ["", ...notIncludedSports.map((e) => e.sport)],
            (a, b) => a.localeCompare(b),
          );
        }
      });
    }
  });

  test("Add new", async () => {
    const user = userEvent.setup();

    const initialSports: SportInfo[] = [
      {
        sport: Sport.Tennis,
        ability: AbilityLevel.Beginner,
      },
    ];

    const component = render(
      <Wrapper
        initialSports={initialSports}
        expectedSelection={[
          ...initialSports,
          { sport: Sport.Squash, ability: undefined },
        ]}
      />,
    );

    expect(component.container).toBeInTheDocument();

    const menu = component.container.children[0];

    expect(menu.children.length).toBe(2);
    await user.selectOptions(menu.children[1], "Squash");

    expect(menu.children.length).toBe(3);
    const abilitySelect = menu.children[1].children[1] as HTMLSelectElement;
    expect(abilitySelect.value).toBe("");
  });

  test("Update sport", async () => {
    const user = userEvent.setup();

    const initialSports: SportInfo[] = [
      {
        sport: Sport.Tennis,
        ability: AbilityLevel.Beginner,
      },
    ];

    const component = render(
      <Wrapper
        initialSports={initialSports}
        expectedSelection={[
          { sport: Sport.Badminton, ability: AbilityLevel.Beginner },
        ]}
      />,
    );

    expect(component.container).toBeInTheDocument();

    const menu = component.container.children[0];

    expect(menu.children.length).toBe(2);
    const sportsSelect = menu.children[0].children[0].querySelector("select");
    expect(sportsSelect).not.toBeNull();
    if (sportsSelect) await user.selectOptions(sportsSelect, "Badminton");

    expect(menu.children.length).toBe(2);
    expect(sportsSelect?.value).toBe(Sport.Badminton);
  });

  test("Update ability", async () => {
    const user = userEvent.setup();

    const initialSports: SportInfo[] = [
      {
        sport: Sport.Tennis,
        ability: AbilityLevel.Beginner,
      },
    ];

    const component = render(
      <Wrapper
        initialSports={initialSports}
        expectedSelection={[
          { sport: Sport.Tennis, ability: AbilityLevel.Advanced },
        ]}
      />,
    );

    expect(component.container).toBeInTheDocument();

    const menu = component.container.children[0];

    expect(menu.children.length).toBe(2);
    const abilitySelect = menu.children[0].children[1] as HTMLSelectElement;
    await user.selectOptions(abilitySelect, "Advanced");

    expect(menu.children.length).toBe(2);
    expect(abilitySelect.value).toBe(AbilityLevel.Advanced);
  });
});

function Wrapper({
  initialSports,
  expectedSelection,
}: {
  initialSports: SportInfo[];
  expectedSelection: Partial<SportInfo>[];
}) {
  const [sports, setSports] = useState<SportInfo[]>(initialSports);

  const setSportsWrapper = (newVal: SportInfo[]) => {
    expect(newVal).toStrictEqual(expectedSelection);
    setSports(newVal);
  };

  return <SportsAddMenu sports={sports} setSports={setSportsWrapper} />;
}
