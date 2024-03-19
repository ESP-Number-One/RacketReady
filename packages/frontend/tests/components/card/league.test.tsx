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
import { MockAPI } from "../../helpers/utils";
import { LeagueCard } from "../../../src/components/card/league";
import { mockLinks } from "../../helpers/mock";

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

jest.mock("../../../src/state/nav");
jest.mock("react-router-dom");
mockLinks();

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

    // Expect no date div if there isn't any date
    expect(leagueCard.container.querySelectorAll(".date").length).toBe(0);
  });

  test("Starting Date", async () => {
    const leagueCard = render(
      <SucessfulAPI>
        <LeagueCard data={WITH_PICTURE} />
      </SucessfulAPI>,
    );

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
