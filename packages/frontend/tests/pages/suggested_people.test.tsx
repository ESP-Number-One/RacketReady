import {
  act,
  fireEvent,
  getByPlaceholderText,
  render,
  waitFor,
} from "@testing-library/react";
import {
  type CensoredUser,
  ObjectId,
  type PageOptions,
  type SortQuery,
  type User,
  type UserMatchReturn,
  type UserQuery,
} from "@esp-group-one/types";
import { Sport } from "@esp-group-one/types";
import type { UserAPIClient } from "@esp-group-one/api-client/build/src/sub/user";
import { IDS, getUser } from "@esp-group-one/types/build/tests/helpers/utils";
import userEvent from "@testing-library/user-event";
import moment from "moment";
import { MockAPI, wait } from "../helpers/utils";
import { SuggestedPeople } from "../../src/pages/suggested_people";
import { mockRouting } from "../__meta__";
import { PageTester, randomOId } from "./helpers";

const userFindFn = jest.fn<
  Promise<CensoredUser[]>,
  [PageOptions<UserQuery, SortQuery<User>>],
  UserAPIClient
>();
const recommendFn = jest.fn<Promise<UserMatchReturn>, [], UserAPIClient>();
const availabilityFn = jest.fn<Promise<string[]>, [ObjectId], UserAPIClient>();

const MockedAPI = MockAPI({
  user: () => ({
    find: userFindFn,
    recommendations: recommendFn,
    findAvailabilityWith: availabilityFn,
  }),
});

describe("Success Route", () => {
  test("Standard", async () => {
    const { useNavigate } = await mockRouting();
    const nav = jest.fn();
    useNavigate.mockImplementation(() => {
      return nav;
    });

    userFindFn.mockImplementation(
      ({ query: { profileText } = { profileText: undefined } }) =>
        Promise.resolve([
          getUser({ _id: new ObjectId(IDS[1]), name: profileText }),
        ]),
    );

    recommendFn.mockImplementation(() =>
      Promise.resolve([
        {
          u: getUser({ _id: new ObjectId(IDS[2]), name: "Bot C" }),
          sport: Sport.Badminton,
        },
      ]),
    );

    const now = moment();

    availabilityFn.mockImplementation(() =>
      Promise.resolve(
        [now, now.add(1, "hour"), now.add(2, "hours")].map((t) =>
          t.toISOString(),
        ),
      ),
    );

    const comp = render(
      <PageTester route="/search">
        <MockedAPI>
          <SuggestedPeople />
        </MockedAPI>
      </PageTester>,
    );

    await waitFor(() => {
      expect(comp.container).not.toHaveTextContent(/wait/i);
    });

    await userEvent.click(
      comp.getByText("Bot C").parentElement!.parentElement!,
    );

    expect(nav).toHaveBeenCalled();

    await userEvent.type(
      getByPlaceholderText(comp.container, "Search people!"),
      "Bot A",
    );

    act(() => void 0);

    await userEvent.click(comp.getByTestId("search-button"));

    await act(() => Promise.resolve());
  });

  test("Long recommendations list", async () => {
    userFindFn.mockImplementation(
      ({ query: { profileText } = { profileText: undefined } }) =>
        Promise.resolve([getUser({ name: profileText })]),
    );

    recommendFn.mockImplementation(() => {
      const arr = Array(20)
        .fill(0)
        .map(() => ({
          u: getUser({ _id: randomOId(), name: "Bot C" }),
          sport: Sport.Badminton,
        }));
      expect(arr.length).toBe(20);
      return Promise.resolve(arr);
    });

    const now = moment();

    availabilityFn.mockImplementation(() =>
      Promise.resolve(
        [now, now.add(1, "hour"), now.add(2, "hours")].map((t) =>
          t.toISOString(),
        ),
      ),
    );

    const comp = render(
      <PageTester route="/search">
        <MockedAPI>
          <SuggestedPeople />
        </MockedAPI>
      </PageTester>,
    );

    await waitFor(() => {
      expect(comp.container).not.toHaveTextContent(/wait/i);
    });

    const feed: HTMLDivElement = comp.container.querySelector(
      ".h-full.overflow-y-scroll.grid.grid-flow-row",
    )!;

    act(() => {
      fireEvent.scroll(feed, { target: { scrollTop: feed.scrollHeight } });
    });

    await act(() => wait(100));
  });
});

describe("API Failure", () => {
  test("Recommendations Fail", async () => {
    const consoleWarn = jest
      .spyOn(console, "warn")
      .mockImplementationOnce(() => void 0);

    userFindFn.mockImplementation(
      ({ query: { profileText } = { profileText: undefined } }) =>
        Promise.resolve([
          getUser({ _id: new ObjectId(IDS[1]), name: profileText }),
        ]),
    );

    recommendFn.mockImplementation(() =>
      Promise.reject(new Error("API ERROR")),
    );

    const now = moment();

    availabilityFn.mockImplementation(() =>
      Promise.resolve(
        [now, now.add(1, "hour"), now.add(2, "hours")].map((t) =>
          t.toISOString(),
        ),
      ),
    );

    const comp = render(
      <PageTester route="/search">
        <MockedAPI>
          <SuggestedPeople />
        </MockedAPI>
      </PageTester>,
    );

    await waitFor(() => {
      expect(comp.container).not.toHaveTextContent(/wait/i);
    });

    expect(consoleWarn).toHaveBeenCalled();
  });

  test("Search Fail", async () => {
    userFindFn.mockImplementation(() =>
      Promise.reject(new Error("Unauthorised!")),
    );

    recommendFn.mockImplementation(() =>
      Promise.resolve([
        {
          u: getUser({ _id: new ObjectId(IDS[2]), name: "Bot C" }),
          sport: Sport.Badminton,
        },
      ]),
    );

    const now = moment();

    availabilityFn.mockImplementation(() =>
      Promise.resolve(
        [now, now.add(1, "hour"), now.add(2, "hours")].map((t) =>
          t.toISOString(),
        ),
      ),
    );

    const comp = render(
      <PageTester route="/search">
        <MockedAPI>
          <SuggestedPeople />
        </MockedAPI>
      </PageTester>,
    );

    await waitFor(() => {
      expect(comp.container).not.toHaveTextContent(/wait/i);
    });

    await userEvent.type(
      getByPlaceholderText(comp.container, "Search people!"),
      "Bot A",
    );

    act(() => void 0);

    await userEvent.click(comp.getByTestId("search-button"));

    await act(() => Promise.resolve());

    expect(comp.container).toHaveTextContent("Unauthorised!");
  });
});
