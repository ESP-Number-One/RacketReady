import { AbilityLevel, ObjectId, Sport } from "@esp-group-one/types";
import { PICTURES } from "@esp-group-one/types/build/tests/helpers/utils";
import { cleanup, render } from "@testing-library/react";
import moment from "moment";
import { RecProfile } from "../../../src/components/rec_profile";
import { mockLinks } from "../../helpers/mock";

jest.mock("../../../src/state/nav");
jest.mock("react-router-dom");
mockLinks();

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
    profilePicture: `data:image/web,base64,${PICTURES[0]}`,
    rating: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 },
  },
  availability: [
    moment("2024-03-12T11:30:00Z"),
    moment("2024-03-13T13:30:00Z"),
    moment("2024-03-14T15:30:00Z"),
  ],
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
    profilePicture: `data:image/web,base64,${PICTURES[0]}`,
    rating: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 },
  },
  availability: [],
  displayAbility: false,
};

describe("RecProfile", () => {
  test("it should render without crashing", () => {
    render(
      <RecProfile
        user={mockProfile.user}
        sport={mockProfile.user.sports[0]}
        availability={mockProfile.availability}
        proposeMatch={() => void 0}
      />,
    );
  });

  it("should have the correct text", () => {
    const component = render(
      <RecProfile
        user={mockProfile.user}
        sport={mockProfile.user.sports[0]}
        availability={mockProfile.availability}
        proposeMatch={() => void 0}
      />,
    );
    expect(component.container).toHaveTextContent(mockProfile.user.name);
    expect(component.container).toHaveTextContent(
      Sport.Badminton.charAt(0).toUpperCase() + Sport.Badminton.slice(1),
    );
  });

  it("should not have the availabilities section if there are none provided", () => {
    const component = render(
      <RecProfile
        user={mockUnavailableProfile.user}
        sport={mockProfile.user.sports[0]}
        availability={mockUnavailableProfile.availability}
        proposeMatch={() => void 0}
      />,
    );

    expect(
      component.container.getElementsByClassName(
        "bg-slate-400 px-5 pt-2 pb-2 mt-1 space-y-2 overflow-scroll rounded-b-lg",
      ).length,
    ).toBe(0);
  });
});
