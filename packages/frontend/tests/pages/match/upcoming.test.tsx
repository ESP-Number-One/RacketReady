// API
//  match
//    find
//    findProposed
//  user
//    me
//    find

import {
  getMatch,
  getUser,
} from "@esp-group-one/types/build/tests/helpers/utils";
import { act, render } from "@testing-library/react";
import { IDS } from "@esp-group-one/test-helpers-base";
import { MatchStatus, ObjectId } from "@esp-group-one/types";
import { mockRouting } from "../../__meta__";
import { MockAPI } from "../../helpers/utils";
import { PageTester, randomOId } from "../helpers";
import { UpcomingMatch } from "../../../src/pages/match/upcoming";

const navFn = jest.fn();

beforeAll(async () => {
  const { useNavigate } = await mockRouting();
  useNavigate.mockReturnValue(navFn);
});

test("Success", async () => {
  const MockedAPI = MockAPI({
    user: () => ({
      me: () =>
        Promise.resolve(getUser({ _id: new ObjectId(IDS[0]), name: "Me" })),
      find: () =>
        Promise.resolve([
          getUser({ _id: new ObjectId(IDS[1]), name: "Test Bot" }),
        ]),
    }),
    match: () => ({
      findProposed: () =>
        Promise.resolve([
          getMatch({
            _id: new ObjectId(IDS[2]),
            status: MatchStatus.Request,
            owner: new ObjectId(IDS[1]),
            players: [new ObjectId(IDS[1]), new ObjectId(IDS[0])],
          }),
        ]),
      find: () =>
        Promise.resolve([
          getMatch({
            _id: new ObjectId(IDS[3]),
            status: MatchStatus.Accepted,
            owner: new ObjectId(IDS[1]),
            players: [new ObjectId(IDS[1]), new ObjectId(IDS[2])],
          }),
          getMatch({
            _id: new ObjectId(IDS[4]),
            status: MatchStatus.Accepted,
            owner: new ObjectId(IDS[1]),
            players: [new ObjectId(IDS[1]), new ObjectId(IDS[2])],
          }),
        ]),
    }),
  });

  const comp = render(
    <PageTester route="/match/proposals">
      <MockedAPI>
        <UpcomingMatch />
      </MockedAPI>
    </PageTester>,
  );

  await act(() => Promise.resolve());

  expect(comp.container).toHaveTextContent("1 Proposed Matches");
});

test("API Error", async () => {
  const errStr = "Database gave up :(";

  const MockedAPI = MockAPI({
    user: () => ({
      me: () =>
        Promise.resolve(getUser({ _id: new ObjectId(IDS[0]), name: "Me" })),
      find: () => Promise.reject(new Error(errStr)),
    }),
    match: () => ({
      findProposed: () => Promise.reject(new Error(errStr)),
      find: () => Promise.reject(new Error(errStr)),
    }),
  });

  const comp = render(
    <PageTester route="/match/proposals">
      <MockedAPI>
        <UpcomingMatch />
      </MockedAPI>
    </PageTester>,
  );

  await act(() => Promise.resolve());

  expect(comp.container).toHaveTextContent(errStr);
});

test("Proposed Match > 10", async () => {
  const MockedAPI = MockAPI({
    user: () => ({
      me: () =>
        Promise.resolve(getUser({ _id: new ObjectId(IDS[0]), name: "Me" })),
      find: () =>
        Promise.resolve([
          getUser({ _id: new ObjectId(IDS[1]), name: "Test Bot" }),
        ]),
    }),
    match: () => ({
      findProposed: () =>
        Promise.resolve(
          Array(11)
            .fill(0)
            .map(() =>
              getMatch({
                _id: randomOId(),
                status: MatchStatus.Request,
                owner: new ObjectId(IDS[1]),
                players: [new ObjectId(IDS[1]), new ObjectId(IDS[0])],
              }),
            ),
        ),
      find: () =>
        Promise.resolve([
          getMatch({
            _id: new ObjectId(IDS[3]),
            status: MatchStatus.Accepted,
            owner: new ObjectId(IDS[1]),
            players: [new ObjectId(IDS[1]), new ObjectId(IDS[2])],
          }),
          getMatch({
            _id: new ObjectId(IDS[4]),
            status: MatchStatus.Accepted,
            owner: new ObjectId(IDS[1]),
            players: [new ObjectId(IDS[1]), new ObjectId(IDS[2])],
          }),
        ]),
    }),
  });

  const comp = render(
    <PageTester route="/match/proposals">
      <MockedAPI>
        <UpcomingMatch />
      </MockedAPI>
    </PageTester>,
  );

  await act(() => Promise.resolve());

  expect(comp.container).toHaveTextContent("10+ Proposed Matches");
});
