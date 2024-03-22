import {
  getMatch,
  getUser,
} from "@esp-group-one/types/build/tests/helpers/utils";
import { act, render } from "@testing-library/react";
import { ObjectId } from "@esp-group-one/types";
import { IDS } from "@esp-group-one/test-helpers-base";
// eslint-disable-next-line import/no-named-as-default -- Necessary default import.
import userEvent from "@testing-library/user-event";
import { MockAPI } from "../../helpers/utils";
import { PageTester } from "../helpers";
import { MatchProposal } from "../../../src/pages/match/proposal";

test("Success", async () => {
  const acceptFn = jest.fn().mockImplementation(() => Promise.resolve());
  const cancelFn = jest.fn().mockImplementation(() => Promise.resolve());
  const MockedAPI = MockAPI({
    user: () => ({
      find: () =>
        Promise.resolve([
          getUser({ _id: new ObjectId(IDS[1]), name: "Player A" }),
          getUser({ _id: new ObjectId(IDS[2]), name: "Player B" }),
        ]),
    }),
    match: () => ({
      findProposed: () =>
        Promise.resolve([
          getMatch({
            _id: new ObjectId(IDS[0]),
            players: [new ObjectId(IDS[1]), new ObjectId(IDS[2])],
          }),
          getMatch({
            _id: new ObjectId(IDS[3]),
            players: [new ObjectId(IDS[4]), new ObjectId(IDS[3])],
          }),
        ]),
      accept: acceptFn,
      cancel: cancelFn,
    }),
  });

  const comp = render(
    <PageTester route="/match/proposals">
      <MockedAPI>
        <MatchProposal />
      </MockedAPI>
    </PageTester>,
  );

  await act(() => Promise.resolve());

  await userEvent.click(comp.getByText("Accept"));
  await act(() => Promise.resolve());

  expect(acceptFn).toHaveBeenCalledWith(new ObjectId(IDS[0]));

  await userEvent.click(comp.getByText("Decline"));
  await act(() => Promise.resolve());

  expect(cancelFn).toHaveBeenCalledWith(new ObjectId(IDS[0]));
});
