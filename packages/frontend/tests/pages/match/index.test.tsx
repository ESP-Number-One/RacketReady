import { act, render, waitFor } from "@testing-library/react";
import { IDS } from "@esp-group-one/test-helpers-base";
import {
  getMatch,
  getUser,
} from "@esp-group-one/types/build/tests/helpers/utils";
import { MatchStatus, ObjectId } from "@esp-group-one/types";
import userEvent from "@testing-library/user-event";
import { MockAPI } from "../../helpers/utils";
import { SingleMatchPage } from "../../../src/pages/match";
import { PageTester } from "../helpers";

test("Render", async () => {
  const MockedAPI = MockAPI({
    user: () => ({
      me: () =>
        Promise.resolve(getUser({ _id: new ObjectId(IDS[0]), name: "Bot A" })),
      getId: (id) => {
        switch (id.toString()) {
          case IDS[0]:
            return Promise.resolve(
              getUser({ _id: new ObjectId(IDS[0]), name: "Bot A" }),
            );
          case IDS[2]:
            return Promise.resolve(
              getUser({ _id: new ObjectId(IDS[2]), name: "Bot B" }),
            );
        }
        throw new Error("UNREACHABLE!");
      },
    }),
    match: () => ({
      getId: () =>
        Promise.resolve(
          getMatch({
            _id: new ObjectId(IDS[1]),
            players: [new ObjectId(IDS[0]), new ObjectId(IDS[2])],
            status: MatchStatus.Complete,
            usersRated: [new ObjectId(IDS[2])],
          }),
        ),
    }),
  });

  const comp = render(
    <PageTester route="/match/:id" path={`/match/${IDS[0]}`}>
      <MockedAPI>
        <SingleMatchPage />
      </MockedAPI>
    </PageTester>,
  );

  await waitFor(() => {
    expect(comp.container).not.toHaveTextContent(/loading/i);
  });

  act(() => void 0);

  await userEvent.click(comp.getByText(/rate/i));
  act(() => void 0);
});

test("Error", async () => {
  const MockedAPI = MockAPI({});
  const comp = render(
    <PageTester route="/match/:id" path={`/match/${IDS[0]}`}>
      <MockedAPI>
        <SingleMatchPage />
      </MockedAPI>
    </PageTester>,
  );

  await waitFor(() => {
    expect(comp.container).not.toHaveTextContent(/loading/i);
  });
});
