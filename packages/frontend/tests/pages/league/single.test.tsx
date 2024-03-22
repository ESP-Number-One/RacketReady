import { IDS } from "@esp-group-one/test-helpers-base";
import {
  getLeague,
  getMatch,
  getUser,
} from "@esp-group-one/types/build/tests/helpers/utils";
import { act, getByText, render } from "@testing-library/react";
import { ObjectId, Sort } from "@esp-group-one/types";
import moment from "moment";
import { userEvent } from "@testing-library/user-event";
import { MockAPI, MockErrorHandler, wait } from "../../helpers/utils";
import { SingleLeaguePage } from "../../../src/pages/league/single";
import { PageTester } from "../helpers";
import { mockRouting } from "../../__meta__";

declare const global: Window;

describe("Routing failures", () => {
  test("Redirect", async () => {
    const Routing = await mockRouting();

    Routing.redirect.mockReturnValueOnce(void 0 as unknown as Response);
    Routing.useParams.mockReturnValueOnce({});

    const MockedAPI = MockAPI({});

    const comp = render(
      <PageTester route="/league/:id" path="/league/apples">
        <MockedAPI>
          <SingleLeaguePage />
        </MockedAPI>
      </PageTester>,
    );

    await act(() => Promise.resolve());

    expect(comp.container).toBeEmptyDOMElement();
    expect(Routing.redirect).toHaveBeenCalledWith("/leagues");
  });

  test("Invalid id", () => {
    const MockedAPI = MockAPI({});

    const comp = render(
      <PageTester route="/league/:id" path="/league/2000">
        <MockedAPI>
          <SingleLeaguePage />
        </MockedAPI>
      </PageTester>,
    );

    expect(comp.container).toHaveTextContent(/not valid league id!/i);
  });
});

describe("General", () => {
  test("TBD Matches", async () => {
    const MockedAPI = MockAPI({
      user: () => ({
        me: () => Promise.resolve(getUser({})),
      }),
      league: () => ({
        getId: (id) =>
          Promise.resolve(getLeague({ _id: id, name: "TEST LEAGUE" })),
        rounds: () => Promise.resolve({ rounds: [1] }),
      }),
      match: () => ({
        find: () => Promise.resolve([]),
      }),
    });

    const pageOuter = await act(async () => {
      const outer = render(
        <PageTester route="/league/:id" path={`/league/${IDS[0]}`}>
          <MockedAPI>
            <SingleLeaguePage />
          </MockedAPI>
        </PageTester>,
      );

      await wait(100); // Wait for loading to finish.
      return outer.container;
    });

    const page = pageOuter.children[0] as HTMLDivElement;

    expect(page).toBeInTheDocument();
    expect(page).toHaveTextContent("TEST LEAGUE");
    expect(page).toHaveTextContent("TBD");
    expect(page).toHaveTextContent("Join");
  });

  test("One match total", async () => {
    const MockedAPI = MockAPI({
      user: () => ({
        me: () =>
          Promise.resolve(
            getUser({ _id: new ObjectId(IDS[1]), name: "Player A" }),
          ),
        getId: (id) => {
          switch (id.toString()) {
            case IDS[1]:
              return Promise.resolve(
                getUser({ _id: new ObjectId(IDS[1]), name: "Player A" }),
              );
            case IDS[2]:
              return Promise.resolve(
                getUser({ _id: new ObjectId(IDS[2]), name: "Player B" }),
              );
          }

          return Promise.reject(new Error("No user found."));
        },
      }),
      league: () => ({
        getId: (id) =>
          Promise.resolve(getLeague({ _id: id, name: "TEST LEAGUE" })),
        rounds: () => Promise.resolve({ rounds: [1] }),
      }),
      match: () => ({
        find: () =>
          Promise.resolve([
            getMatch({
              date: "2024-03-19T02:56:52.000Z",
              league: new ObjectId(IDS[0]),
              players: [new ObjectId(IDS[1]), new ObjectId(IDS[2])],
              round: 1,
            }),
          ]),
      }),
    });

    const pageOuter = await act(async () => {
      const outer = render(
        <PageTester route="/league/:id" path={`/league/${IDS[0]}`}>
          <MockedAPI>
            <SingleLeaguePage />
          </MockedAPI>
        </PageTester>,
      );

      await wait(100); // Wait for loading to finish.
      return outer.container;
    });

    const page = pageOuter.children[0] as HTMLDivElement;

    expect(page).toBeInTheDocument();
    expect(page).toHaveTextContent("TEST LEAGUE");
    expect(page).toHaveTextContent("19/03");
    expect(page).toHaveTextContent("Join");
  });

  const date1 = moment().subtract(1, "month");
  const date2 = moment().subtract(1, "day");
  const date3 = moment().add(1, "month");
  const date4 = moment().add(2, "month");

  const joinFn = jest.fn().mockImplementation(() => Promise.resolve());

  const MultiRound = MockAPI({
    user: () => ({
      me: () =>
        Promise.resolve(
          getUser({ _id: new ObjectId(IDS[1]), name: "Player A" }),
        ),
      getId: (id) => {
        switch (id.toString()) {
          case IDS[1]:
            return Promise.resolve(
              getUser({ _id: new ObjectId(IDS[1]), name: "Player A" }),
            );
          case IDS[2]:
            return Promise.resolve(
              getUser({ _id: new ObjectId(IDS[2]), name: "Player B" }),
            );
        }

        return Promise.reject(new Error("No user found."));
      },
    }),
    league: () => ({
      getId: (id) =>
        Promise.resolve(getLeague({ _id: id, name: "TEST LEAGUE" })),
      rounds: () => Promise.resolve({ rounds: [1, 2] }),
      join: joinFn,
    }),
    match: () => ({
      find: ({ sort, pageSize }) => {
        const first = getMatch({
          date: date1.toISOString(),
          league: new ObjectId(IDS[1]),
          players: [new ObjectId(IDS[1]), new ObjectId(IDS[2])],
          round: 1,
        });

        const last = getMatch({
          date: date4.toISOString(),
          league: new ObjectId(IDS[1]),
          players: [new ObjectId(IDS[1]), new ObjectId(IDS[2])],
          round: 2,
        });

        if (sort?.date === Sort.ASC && pageSize === 1) {
          return Promise.resolve([first]);
        }
        if (sort?.date === Sort.DESC && pageSize === 1) {
          return Promise.resolve([last]);
        }

        return Promise.resolve([
          first,
          getMatch({
            date: date2.toISOString(),
            league: new ObjectId(IDS[1]),
            players: [new ObjectId(IDS[1]), new ObjectId(IDS[2])],
            round: 1,
          }),
          getMatch({
            date: date3.toISOString(),
            league: new ObjectId(IDS[1]),
            players: [new ObjectId(IDS[1]), new ObjectId(IDS[2])],
            round: 2,
          }),
          last,
        ]);
      },
    }),
  });

  test("Multiple matches", async () => {
    const { useNavigate } = await mockRouting();
    const nav = jest.fn();
    useNavigate.mockImplementation(() => {
      return nav;
    });

    const pageOuter = await act(async () => {
      const outer = render(
        <PageTester route="/league/:id" path={`/league/${IDS[0]}`}>
          <MultiRound>
            <SingleLeaguePage />
          </MultiRound>
        </PageTester>,
      );

      await wait(100); // Wait for loading to finish.
      return outer.container;
    });

    const page = pageOuter.children[0] as HTMLDivElement;

    expect(page).toBeInTheDocument();
    expect(page).toHaveTextContent("TEST LEAGUE");
    expect(page).toHaveTextContent(date1.format("DD/MM"));
    expect(page).toHaveTextContent(date4.format("DD/MM"));

    // Expect the Join button to work...
    expect(page).toHaveTextContent("Join");
    await userEvent.click(getByText(page, "Join"));
    await act(() => Promise.resolve());
    expect(joinFn).toHaveBeenCalled();

    // Expect the leave button to now exist.

    // There's a warning outputted here, so let's 'catch' that.
    const warn = jest.spyOn(console, "warn").mockReturnValue();

    expect(page).toHaveTextContent("Leave");
    await userEvent.click(getByText(page, "Leave"));
    await act(() => Promise.resolve());
    expect(warn).toHaveBeenCalled();

    // "Your Matches"

    await userEvent.click(getByText(page, "Your Matches"));
    await act(() => Promise.resolve());
    expect(nav).toHaveBeenCalledWith("/", {
      state: { filter: { match: IDS[0] } },
    });

    // Round 2.
    await userEvent.click(getByText(page, "RND. 2"));
    await act(() => Promise.resolve());
    expect(getByText(page, "RND. 2")).toHaveClass("bg-p-blue");
  });

  test("Share button", async () => {
    const { useNavigate } = await mockRouting();
    const nav = jest.fn();
    useNavigate.mockImplementation(() => {
      return nav;
    });

    const pageOuter = await act(async () => {
      const outer = render(
        <PageTester route="/league/:id" path={`/league/${IDS[0]}`}>
          <MultiRound>
            <SingleLeaguePage />
          </MultiRound>
        </PageTester>,
      );

      await wait(100); // Wait for loading to finish.
      return outer.container;
    });

    const page = pageOuter.children[0] as HTMLDivElement;
    const fn = jest.fn();

    global.navigator.share = fn;

    // Click the share button.
    await userEvent.click(getByText(page, "Share"));
    expect(fn).toHaveBeenCalled();

    global.navigator.share = undefined as unknown as Navigator["share"];
    await userEvent.click(getByText(page, "Share"));
  });

  const Failing = MockAPI({
    user: () => ({
      me: () => Promise.reject(new Error("Not found.")),
    }),
  });

  test("Failing", async () => {
    const { useNavigate } = await mockRouting();
    const err = jest.fn();
    const nav = jest.fn();
    useNavigate.mockImplementationOnce(() => {
      return nav;
    });

    const ErrorHandler = MockErrorHandler(err);

    await act(() => {
      const outer = render(
        <PageTester route="/league/:id" path={`/league/${IDS[0]}`}>
          <ErrorHandler>
            <Failing>
              <SingleLeaguePage />
            </Failing>
          </ErrorHandler>
        </PageTester>,
      );

      return outer.container as HTMLDivElement;
    });
    expect(err).toHaveBeenCalled();
  });
});
