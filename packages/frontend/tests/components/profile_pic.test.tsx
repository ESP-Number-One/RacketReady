import type { SportInfo } from "@esp-group-one/types";
import { AbilityLevel, Sport, makeImgSrc } from "@esp-group-one/types";
import { cleanup, getByText, render } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { PICTURES } from "@esp-group-one/types/build/tests/helpers/utils";
import { ProfilePic } from "../../src/components/profile_pic";

afterAll(cleanup);

describe("profile pic", () => {
  test("Switching selected sports", async () => {
    const user = userEvent.setup();
    const sports: SportInfo[] = [
      { sport: Sport.Tennis, ability: AbilityLevel.Beginner },
      { sport: Sport.Squash, ability: AbilityLevel.Intermediate },
      { sport: Sport.Badminton, ability: AbilityLevel.Advanced },
    ];

    const component = render(
      <ProfilePic image={makeImgSrc(PICTURES[0])} sports={sports} />,
    );

    expect(component.container).toBeInTheDocument();
    expect(component.container.children[0].children.length).toBe(2);

    const buttons = component.container.querySelectorAll("button");
    for (let i = 0; i < buttons.length; i++) {
      // This is so we start at an offset
      const index = (i + 1) % buttons.length;
      const b = buttons[index];

      expect(b.children[0].classList.contains("bg-slate-600")).toBe(true);
      // eslint-disable-next-line no-await-in-loop -- We cannot parallelise it
      await user.click(b);
      expect(b.children[0].classList.contains("bg-slate-600")).toBe(false);
      expect(
        getByText(component.container, upperFirst(sports[index].ability)),
      ).not.toBeNull();
    }
  });

  describe("correct ability level colour", () => {
    for (const ability of Object.values(AbilityLevel)) {
      test(ability, () => {
        const sports: SportInfo[] = [{ sport: Sport.Tennis, ability }];

        const component = render(
          <ProfilePic image={makeImgSrc(PICTURES[0])} sports={sports} />,
        );

        expect(component.container).toBeInTheDocument();
        const abilityDisplay = component.container.children[0].children[1];
        expect(abilityDisplay.classList.contains(`bg-${ability}`)).toBe(true);
      });
    }
  });

  test("don't display ability", () => {
    const sports: SportInfo[] = [
      { sport: Sport.Tennis, ability: AbilityLevel.Beginner },
    ];

    const component = render(
      <ProfilePic
        image={makeImgSrc(PICTURES[0])}
        sports={sports}
        displayAbility={false}
      />,
    );

    expect(component.container).toBeInTheDocument();
    expect(component.container.children[0].children.length).toBe(1);
  });
});

function upperFirst(thing: string) {
  return thing.charAt(0).toUpperCase() + thing.substring(1);
}
