import { act, render } from "@testing-library/react"; //should pass all tests
import "@testing-library/jest-dom";
import {
  Sport,
  type Match,
  type Message,
  ObjectId,
  type League,
  makeImgSrc,
  MatchStatus,
} from "@esp-group-one/types";
import { PICTURES } from "@esp-group-one/types/build/tests/helpers/utils";
import { IDS } from "@esp-group-one/test-helpers-base";
import { MockAPI, MockErrorHandler } from "../../helpers/utils";
import { LeagueCard } from "../../../src/components/card/league";

const WITHOUT_PICTURE = {
  _id: new ObjectId(IDS[0]),
  name: "My Super Cool League",
  sport: Sport.Badminton,
  private: false,
  picture: null,
} as League;

const WITH_PICTURE = {
  ...WITHOUT_PICTURE,
  picture: PICTURES[0],
} as League;

const DUMMY_MATCH = {
  status: MatchStatus.Request,
  date: "2024-02-29T14:00:00Z",
  sport: Sport.Badminton,
  owner: new ObjectId("65e5d03224bc2262eb90c038"),
  players: [new ObjectId("65e5d03224bc2262eb90c038")],
  messages: [] as Message[],
  league: new ObjectId(IDS[0]),
} as Match;
const SucessfulAPI = MockAPI({
  match() {
    return {
      find() {
        return [DUMMY_MATCH] as Match[];
      },
    };
  },
});

describe("Date Handling", () => {
  test("TBD", async () => {
    const MockedAPI = MockAPI({
      match() {
        return {
          find() {
            return [] as Match[];
          },
        };
      },
    });

    const leagueCard = render(
      <MockedAPI>
        <LeagueCard data={WITH_PICTURE} />
      </MockedAPI>,
    );

    // Loading state.
    expect(leagueCard.container).toHaveTextContent(/loading/i);

    // Fetch the stuff from the fake API.
    await act(() => Promise.resolve());

    // Expect title text.
    expect(leagueCard.container).toHaveTextContent(/My Super Cool League/i);

    // Expect sport text.
    expect(leagueCard.container).toHaveTextContent(/badminton/i);

    // Expect to use normal picture.
    expect(leagueCard.container.querySelector("img")).toHaveAttribute(
      "src",
      makeImgSrc(WITH_PICTURE.picture),
    );

    // Expect to "To Be Determined" text.
    expect(leagueCard.container.querySelector(".date")).toHaveTextContent(
      /TBD/i,
    );
  });

  test("Starting Date", async () => {
    const leagueCard = render(
      <SucessfulAPI>
        <LeagueCard data={WITH_PICTURE} />
      </SucessfulAPI>,
    );

    // Loading state.
    expect(leagueCard.container).toHaveTextContent(/loading/i);

    // Fetch the stuff from the fake API.
    await act(() => Promise.resolve());

    // Expect title text.
    expect(leagueCard.container).toHaveTextContent(/My Super Cool League/i);

    // Expect sport text.
    expect(leagueCard.container).toHaveTextContent(/badminton/i);

    // Expect to use normal picture.
    expect(leagueCard.container.querySelector("img")).toHaveAttribute(
      "src",
      makeImgSrc(WITH_PICTURE.picture),
    );

    // Expect the first match's date.
    expect(leagueCard.container.querySelector(".date")).toHaveTextContent(
      /THU/i,
    );
    expect(leagueCard.container.querySelector(".date")).toHaveTextContent(
      /29/i,
    );
    expect(leagueCard.container.querySelector(".date")).toHaveTextContent(
      /feb/i,
    );
  });
});

describe("Badges", () => {
  test("Without badge", async () => {
    const leagueCard = render(
      <SucessfulAPI>
        <LeagueCard data={WITH_PICTURE} />
      </SucessfulAPI>,
    );

    // Loading state.
    expect(leagueCard.container).toHaveTextContent(/loading/i);

    // Fetch the stuff from the fake API.
    await act(() => Promise.resolve());

    // Expect badge not to be present.
    expect(leagueCard.container.querySelector(".badge")).toBeFalsy();
  });

  test("With badge", async () => {
    const leagueCard = render(
      <SucessfulAPI>
        <LeagueCard data={WITH_PICTURE} badge={1} />
      </SucessfulAPI>,
    );

    // Loading state.
    expect(leagueCard.container).toHaveTextContent(/loading/i);

    // Fetch the stuff from the fake API.
    await act(() => Promise.resolve());

    // Expect badge to be present with text "1".
    expect(leagueCard.container.querySelector(".badge")).toBeInTheDocument();
    expect(leagueCard.container.querySelector(".badge")).toHaveTextContent(
      /1/i,
    );
  });
});

test("Erroring", async () => {
  const FailingAPI = MockAPI({
    match() {
      return {
        find: () => Promise.reject(new Error("Failed to find matches.")),
      };
    },
  });

  const errorHandler = jest.fn();
  const ErrorHandling = MockErrorHandler(errorHandler);

  const proposal = render(
    <ErrorHandling>
      <FailingAPI>
        <LeagueCard data={WITHOUT_PICTURE} />
      </FailingAPI>
    </ErrorHandling>,
  );

  // Loading state.
  expect(proposal.container).toHaveTextContent(/loading/i);

  await act(() => Promise.resolve());

  expect(errorHandler).toHaveBeenCalled();
});
