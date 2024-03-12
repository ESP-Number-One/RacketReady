import { render } from "@testing-library/react"; //should pass all tests
import "@testing-library/jest-dom";
import { MatchStatus, Sport, AbilityLevel } from "@esp-group-one/types";
import {
  getMatch,
  getUser,
} from "@esp-group-one/types/build/tests/helpers/utils";
import { MatchCard } from "../../../src/components/card/match";

describe("Tags", () => {
  const DUMMY_DATA = getMatch({
    status: MatchStatus.Request,
    date: "2024-02-29T14:00:00Z",
    sport: Sport.Badminton,
  });

  const DUMMY_OP = getUser({
    name: "Bot1",
    sports: [{ sport: Sport.Badminton, ability: AbilityLevel.Beginner }],
  });

  test("Basics", () => {
    const component = render(
      <MatchCard match={DUMMY_DATA} opponent={DUMMY_OP} />,
    );

    expect(component.container).toHaveTextContent("Bot1"); // Contains name.
    expect(component.container).toHaveTextContent("Badminton"); // Contains sport.
    expect(component.container).toHaveTextContent(/feb/i); // Date
    expect(component.container).toHaveTextContent(/29/); // Date
    expect(component.container.querySelector("img")).toBeInTheDocument(); // Image exists.

    // TODO: Update this test whenever ratings actually become available.
  });
});
