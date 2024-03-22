import { render } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { IDS } from "@esp-group-one/test-helpers-base";
import {
  getMatch,
  getUser,
} from "@esp-group-one/types/build/tests/helpers/utils";
import moment from "moment";
import { MatchStatus, ObjectId, type Scores } from "@esp-group-one/types";
import userEvent from "@testing-library/user-event";
import { mockRouting } from "../../__meta__";
import { MockAPI, wait } from "../../helpers/utils";
import { PageTester } from "../helpers";
import { CompleteMatchForm } from "../../../src/pages/match/complete";

const navFn = jest.fn();
beforeAll(async () => {
  const { useNavigate } = await mockRouting();
  useNavigate.mockReturnValue(navFn);
});

describe("Failing", () => {
  test("No id parameter", async () => {
    const MockedAPI = MockAPI({});

    const comp = render(
      <PageTester route="/match/complete" path="/match/complete">
        <MockedAPI>
          <CompleteMatchForm />
        </MockedAPI>
      </PageTester>,
    );

    await act(() => Promise.resolve());

    expect(comp.container).toHaveTextContent(/not even close/i);
  });

  test("API Error", async () => {
    const errString = "IDK What happened.";
    const MockedAPI = MockAPI({
      user: () => ({
        me: () => Promise.reject(new Error(errString)),
      }),
    });

    const comp = render(
      <PageTester route="/match/complete" path={`/match/complete?id=${IDS[0]}`}>
        <MockedAPI>
          <CompleteMatchForm />
        </MockedAPI>
      </PageTester>,
    );

    await act(() => Promise.resolve());

    expect(comp.container).toHaveTextContent(errString);
  });

  test("Cannot be completed right now", async () => {
    const MockedAPI = MockAPI({
      user: () => ({
        me: () =>
          Promise.resolve(getUser({ _id: new ObjectId(IDS[1]), name: "Me" })),
        find: () =>
          Promise.resolve([
            getUser({ _id: new ObjectId(IDS[2]), name: "Bot B" }),
          ]),
      }),
      match: () => ({
        getId: (_id) =>
          Promise.resolve(
            getMatch({
              _id,
              date: moment().add(1, "day").toISOString(),
              status: MatchStatus.Complete,
            }),
          ),
      }),
    });

    const comp = render(
      <PageTester route="/match/complete" path={`/match/complete?id=${IDS[0]}`}>
        <MockedAPI>
          <CompleteMatchForm />
        </MockedAPI>
      </PageTester>,
    );

    await act(() => Promise.resolve());

    expect(comp.container).toHaveTextContent(
      "Match cannot be completed at the moment",
    );
  });
});

test("Success", async () => {
  const completeFn = jest.fn();
  completeFn.mockImplementation(() => Promise.resolve());

  const rateFn = jest.fn();
  rateFn.mockImplementation(() => Promise.resolve());

  const MockedAPI = MockAPI({
    user: () => ({
      me: () =>
        Promise.resolve(getUser({ _id: new ObjectId(IDS[1]), name: "Me" })),
      find: () =>
        Promise.resolve([
          getUser({ _id: new ObjectId(IDS[2]), name: "Bot B" }),
        ]),
    }),
    match: () => ({
      getId: (_id) =>
        Promise.resolve(
          getMatch({
            _id,
            date: moment().subtract(1, "day").toISOString(),
            status: MatchStatus.Accepted,
          }),
        ),
      complete: completeFn,
      rate: rateFn,
    }),
  });

  const comp = render(
    <PageTester route="/match/complete" path={`/match/complete?id=${IDS[0]}`}>
      <MockedAPI>
        <CompleteMatchForm />
      </MockedAPI>
    </PageTester>,
  );

  await act(() => Promise.resolve());

  const [score1, score2] =
    comp.container.querySelectorAll<HTMLInputElement>(`input[type="number"]`);

  await act(async () => {
    await userEvent.type(score1, "10");
  });

  await act(async () => {
    await userEvent.type(score2, "2");
  });

  const [_1, _2, _3, star4, _5] =
    comp.container.querySelectorAll<HTMLButtonElement>(
      `button:not([type="submit"])`,
    );

  await act(async () => {
    await userEvent.click(star4);
  });

  await userEvent.click(comp.getByText("Submit"));

  await act(() => wait(100));

  expect(completeFn).toHaveBeenCalledWith(new ObjectId(IDS[0]), {
    [IDS[1]]: 2,
    [IDS[2]]: 10,
  } as Scores);

  expect(rateFn).toHaveBeenCalledWith(new ObjectId(IDS[0]), 4);
  expect(navFn).toHaveBeenCalledWith("/", expect.anything());
});
