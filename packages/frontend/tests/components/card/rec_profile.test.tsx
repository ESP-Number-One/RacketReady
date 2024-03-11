import { AbilityLevel, ObjectId, Sport } from "@esp-group-one/types";
import { PICTURES } from "@esp-group-one/types/build/tests/helpers/utils";
import { cleanup, render } from "@testing-library/react";
import { RecProfile } from "../../../src/components/rec_profile";

afterAll(cleanup);

const mockProfile = {
  user: {
    _id: new ObjectId("123456789012345678ABCDEF"),
    name: "Test User",
    description:
      "A very long example description for testing purposes. This description should be long enough to go beyond the 3 lines required for the line clamping to take effect. This description should be long enough to go beyond the 3 lines required for the line clamping to take effect. This description should be long enough to go beyond the 3 lines required for the line clamping to take effect. This description should be long enough to go beyond the 3 lines required for the line clamping to take effect.",
    sports: [
      { sport: Sport.Badminton, ability: AbilityLevel.Beginner },
      { sport: Sport.Tennis, ability: AbilityLevel.Intermediate },
      { sport: Sport.Squash, ability: AbilityLevel.Advanced },
    ],
    rating: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 },
  },
  pfp: `data:image/web,base64,${PICTURES[0]}`,
  availability: [
    "2024-03-12T11:30:00Z",
    "2024-03-13T13:30:00Z",
    "2024-03-14T15:30:00Z",
  ],
  displayAbility: false,
};

const mockUnavailableProfile = {
  user: {
    _id: new ObjectId("123456789012345678ABCDEF"),
    name: "Test User",
    description:
      "A very long example description for testing purposes. This description should be long enough to go beyond the 3 lines required for the line clamping to take effect. This description should be long enough to go beyond the 3 lines required for the line clamping to take effect. This description should be long enough to go beyond the 3 lines required for the line clamping to take effect. This description should be long enough to go beyond the 3 lines required for the line clamping to take effect.",
    sports: [
      { sport: Sport.Badminton, ability: AbilityLevel.Beginner },
      { sport: Sport.Tennis, ability: AbilityLevel.Intermediate },
      { sport: Sport.Squash, ability: AbilityLevel.Advanced },
    ],
    rating: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 },
  },
  pfp: `data:image/web,base64,${PICTURES[0]}`,
  availability: [],
  displayAbility: false,
};

describe("RecProfile", () => {
  test("it should render without crashing", () => {
    render(
      <RecProfile
        user={mockProfile.user}
        pfp={mockProfile.pfp}
        availability={mockProfile.availability}
        displayAbility={mockProfile.displayAbility}
      />,
    );
  });

  it("should have the correct text", () => {
    const component = render(
      <RecProfile
        user={mockProfile.user}
        pfp={mockProfile.pfp}
        availability={mockProfile.availability}
        displayAbility={mockProfile.displayAbility}
      />,
    );
    expect(component.container).toHaveTextContent(mockProfile.user.name);
    expect(component.container).toHaveTextContent(
      Sport.Badminton.charAt(0).toUpperCase() + Sport.Badminton.slice(1),
    );
    expect(component.container).toHaveTextContent(
      Sport.Tennis.charAt(0).toUpperCase() + Sport.Tennis.slice(1),
    );
    expect(component.container).toHaveTextContent(
      Sport.Squash.charAt(0).toUpperCase() + Sport.Squash.slice(1),
    );
  });

  it("should not have the availabilities section if there are none provided", () => {
    const component = render(
      <RecProfile
        user={mockUnavailableProfile.user}
        pfp={mockUnavailableProfile.pfp}
        availability={mockUnavailableProfile.availability}
        displayAbility={mockUnavailableProfile.displayAbility}
      />,
    );

    expect(
      component.container.getElementsByClassName(
        "bg-slate-400 px-5 pt-2 pb-2 mt-1 space-y-2 overflow-scroll rounded-b-lg",
      ).length,
    ).toBe(0);
  });
});
