import { render, waitFor } from "@testing-library/react";
import { getLeague } from "@esp-group-one/types/build/tests/helpers/utils";
import { ObjectId } from "@esp-group-one/types";
import { IDS } from "@esp-group-one/test-helpers-base";
import { PageTester } from "../helpers";
import { MockAPI } from "../../helpers/utils";
import { DiscoverLeagues } from "../../../src/pages/league/discover";

test("Success", async () => {
  const MockedAPI = MockAPI({
    league: () => ({
      find: ({ query: { amIn } = { amIn: undefined } }) => {
        expect(amIn).toBe(false);
        return Promise.resolve(
          Array(3)
            .fill(0)
            .map((_, i) =>
              getLeague({ _id: new ObjectId(IDS[i]), name: `League ${i + 1}` }),
            ),
        );
      },
    }),
  });

  const comp = render(
    <PageTester route="/leagues/discover">
      <MockedAPI>
        <DiscoverLeagues />
      </MockedAPI>
    </PageTester>,
  );

  // Let loading finish.
  await waitFor(() => {
    expect(comp.container).not.toHaveTextContent(/wait/i);
  });

  expect(comp.container).toHaveTextContent("League 1");
  expect(comp.container).toHaveTextContent("League 2");
  expect(comp.container).toHaveTextContent("League 3");
});

test("Empty Leagues", async () => {
  const MockedAPI = MockAPI({
    league: () => ({
      find: () => Promise.resolve([]),
    }),
  });

  const comp = render(
    <PageTester route="/leagues/discover">
      <MockedAPI>
        <DiscoverLeagues />
      </MockedAPI>
    </PageTester>,
  );

  // Let loading finish.
  await waitFor(() => {
    expect(comp.container).not.toHaveTextContent(/wait/i);
  });

  expect(comp.container).toHaveTextContent("No more leagues found.");
});

test("API Error", async () => {
  const MockedAPI = MockAPI({
    league: () => ({
      find: () => Promise.reject(new Error("API ERROR")),
    }),
  });

  const consoleWarn = jest
    .spyOn(console, "warn")
    .mockImplementation(() => void 0);

  const comp = render(
    <PageTester route="/leagues/discover">
      <MockedAPI>
        <DiscoverLeagues />
      </MockedAPI>
    </PageTester>,
  );

  // Let loading finish.
  await waitFor(() => {
    expect(comp.container).not.toHaveTextContent(/wait/i);
  });

  expect(consoleWarn).toHaveBeenCalled();
});
