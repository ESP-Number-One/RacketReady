import { act, render } from "@testing-library/react"; //should pass all tests
import "@testing-library/jest-dom";
import { MatchStatus, Sport, AbilityLevel } from "@esp-group-one/types";
import {
  PICTURES,
  getMatch,
  getUser,
} from "@esp-group-one/types/build/tests/helpers/utils";
import { MatchCard } from "../../../src/components/card/matchcard";
import { MockAPI, MockErrorHandler } from "../../helpers/utils";

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

  const MockedAPI = MockAPI({
    user() {
      return {
        me: () =>
          Promise.resolve(
            getUser({
              sports: [
                { sport: Sport.Badminton, ability: AbilityLevel.Advanced },
              ],
            }),
          ),
        getProfileSrc: (_: string) =>
          Promise.resolve(`data:image/web,base64,${PICTURES[0]}`),
      };
    },
  });
  test("Basics", async () => {
    const component = render(
      <MockedAPI>
        <MatchCard match={DUMMY_DATA} opponent={DUMMY_OP} />
      </MockedAPI>,
    );

    // Loading state.
    expect(component.container).toHaveTextContent(/loading/i);

    // Fetch the stuff from the fake API.
    await act(() => Promise.resolve());

    expect(component.container).toHaveTextContent("Bot1"); // Contains name.
    expect(component.container).toHaveTextContent("Badminton"); // Contains sport.
    expect(component.container).toHaveTextContent(/feb/i); // Date
    expect(component.container).toHaveTextContent(/29/); // Date
    expect(component.container.querySelector("img")).toBeInTheDocument(); // Image exists.

    // TODO: Update this test whenever ratings actually become available.
  });

  test("Erroring", async () => {
    const FailingAPI = MockAPI({
      user() {
        return {
          getId: () => Promise.reject(new Error("Failed to get user")),
          getProfileSrc: () =>
            Promise.reject(new Error("Failed to get profile")),
        };
      },
    });

    const errorHandler = jest.fn();
    const ErrorHandling = MockErrorHandler(errorHandler);

    const proposal = render(
      <ErrorHandling>
        <FailingAPI>
          <MatchCard match={DUMMY_DATA} opponent={DUMMY_OP} />
        </FailingAPI>
      </ErrorHandling>,
    );

    // Loading state.
    expect(proposal.container).toHaveTextContent(/loading/i);

    await act(() => Promise.resolve());

    expect(errorHandler).toHaveBeenCalled();
  });
});
