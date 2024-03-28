import { act, getByText, render } from "@testing-library/react";
import { IDS, getUser } from "@esp-group-one/test-helpers-base";
import { AbilityLevel, ObjectId, Sport } from "@esp-group-one/types";
import { getMatch } from "@esp-group-one/types/build/tests/helpers/utils";
import moment from "moment";
import userEvent from "@testing-library/user-event";
import { MockAPI, wait } from "../helpers/utils";
import { mockRouting } from "../__meta__";
import { ProfilePage } from "../../src/pages/profile";
import { PageTester } from "./helpers";

describe("Failing Externals", () => {
  const BlankAPI = MockAPI({});

  test("No ID Param", async () => {
    const Routing = await mockRouting();

    Routing.useParams.mockReturnValueOnce({});

    const outer = await act(async () => {
      const comp = render(
        <PageTester route="/profile/:id">
          <BlankAPI>
            <ProfilePage />
          </BlankAPI>
        </PageTester>,
      );
      await wait(100);

      return comp.container as HTMLDivElement;
    });

    const el = outer.children.item(0)! as HTMLDivElement;
    expect(el).toHaveTextContent("No user id provided.");
  });

  test("Malformed ID", async () => {
    const outer = await act(async () => {
      const comp = render(
        <PageTester route="/profile/:id" path="/profile/MALFORMED-ID">
          <BlankAPI>
            <ProfilePage />
          </BlankAPI>
        </PageTester>,
      );
      await wait(100);

      return comp.container as HTMLDivElement;
    });

    const el = outer.children.item(0) as HTMLDivElement;
    expect(el).toHaveTextContent("Input must be a 24 character hex string");
  });

  test("User doesn't exist", async () => {
    const msg = "Obj not found.";
    const FailingAPI = MockAPI({
      user: () => ({ getId: () => Promise.reject(new Error(msg)) }),
    });

    const outer = await act(async () => {
      const comp = render(
        <PageTester route="/profile/:id" path={`/profile/${IDS[1]}`}>
          <FailingAPI>
            <ProfilePage />
          </FailingAPI>
        </PageTester>,
      );
      await wait(100);

      return comp.container as HTMLDivElement;
    });

    const el = outer.children.item(0) as HTMLDivElement;
    expect(el).toHaveTextContent(msg);
  });
});

test("Good path", async () => {
  const date = moment();
  const MockedAPI = MockAPI({
    user: () => ({
      getId: () =>
        Promise.resolve(
          getUser({
            _id: new ObjectId(IDS[1]),
            rating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 },
            sports: [{ sport: Sport.Tennis, ability: AbilityLevel.Advanced }],
          }),
        ),
    }),
    match: () => ({
      find: () =>
        Promise.resolve([
          getMatch({
            owner: new ObjectId(IDS[0]),
            players: [new ObjectId(IDS[1]), new ObjectId(IDS[0])],
            date: date.toISOString(),
          }),
        ]),
    }),
  });

  const { useNavigate } = await mockRouting();
  const nav = jest.fn();
  useNavigate.mockImplementation(() => {
    return nav;
  });

  const outer = await act(async () => {
    const comp = render(
      <PageTester route="/profile/:id" path={`/profile/${IDS[1]}`}>
        <MockedAPI>
          <ProfilePage />
        </MockedAPI>
      </PageTester>,
    );

    await wait(100);

    return comp.container;
  });

  const el = outer.children.item(0) as HTMLDivElement;

  // Expect to "advanced" at "tennis".
  expect(el).toHaveTextContent("Tennis");
  expect(el).toHaveTextContent("Advanced");

  // Expect five filled in stars.
  expect(
    el.querySelectorAll(`svg[data-icon="star"][data-prefix="fas"]`).length,
  ).toBe(5);

  // Press the propose button.
  await userEvent.click(getByText(el, "Propose"));
  expect(nav).toHaveBeenCalledWith(
    `/match/new?to=${IDS[1]}`,
    expect.anything(),
  );
});
