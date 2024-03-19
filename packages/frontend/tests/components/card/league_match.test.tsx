import { getByText, prettyDOM, render } from "@testing-library/react"; //should pass all tests
import "@testing-library/jest-dom";
import { MatchStatus, ObjectId } from "@esp-group-one/types";
import {
  getMatch,
  getUser,
} from "@esp-group-one/types/build/tests/helpers/utils";
import { IDS } from "@esp-group-one/test-helpers-base";
import { LeagueMatch } from "../../../src/components/card/league_match";

jest.mock("../../../src/state/nav");

test("Without scores", () => {
  const comp = render(
    <LeagueMatch
      match={getMatch({
        status: MatchStatus.Request,
        players: [new ObjectId(IDS[0]), new ObjectId(IDS[1])],
      })}
      players={{
        [IDS[0]]: getUser({ _id: new ObjectId(IDS[0]), name: "User A" }),
        [IDS[1]]: getUser({ _id: new ObjectId(IDS[0]), name: "User B" }),
      }}
    />,
  );

  const base = comp.container.children.item(0) as HTMLDivElement;

  expect(base).toHaveTextContent("User A");
  expect(base).toHaveTextContent("User B");

  console.log(prettyDOM(base));
});

describe("With scores", () => {
  const BASE = {
    status: MatchStatus.Complete,
    players: [new ObjectId(IDS[0]), new ObjectId(IDS[1])],
    score: {
      [IDS[0]]: 1,
      [IDS[1]]: 5,
    },
  };

  const PLAYERS = {
    [IDS[0]]: getUser({ _id: new ObjectId(IDS[0]), name: "User A" }),
    [IDS[1]]: getUser({ _id: new ObjectId(IDS[1]), name: "User B" }),
  };

  test("A wins", () => {
    const comp = render(
      <LeagueMatch
        match={getMatch({
          ...BASE,
          score: {
            [IDS[0]]: 79927,
            [IDS[1]]: 5,
          },
        })}
        players={PLAYERS}
      />,
    );

    const base = comp.container.children.item(0) as HTMLDivElement;

    console.log(prettyDOM(base));

    expect(getByText(base, "79927")).toHaveClass("bg-p-green-100");
    expect(getByText(base, "5")).not.toHaveClass("bg-p-green-100");
  });

  test("B wins", () => {
    const comp = render(
      <LeagueMatch
        match={getMatch({
          ...BASE,
          score: {
            [IDS[0]]: 1,
            [IDS[1]]: 5,
          },
        })}
        players={PLAYERS}
      />,
    );

    const base = comp.container.children.item(0) as HTMLDivElement;

    expect(getByText(base, "5")).toHaveClass("bg-p-green-100");
    expect(getByText(base, "1")).not.toHaveClass("bg-p-green-100");
  });

  test("Draw", () => {
    const comp = render(
      <LeagueMatch
        match={getMatch({
          ...BASE,
          score: {
            [IDS[0]]: 1,
            [IDS[1]]: 1,
          },
        })}
        players={PLAYERS}
      />,
    );

    const base = comp.container.children.item(0) as HTMLDivElement;

    console.log([...base.querySelectorAll(".col-start-3.col-end-4")]);
  });
});
