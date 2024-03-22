import {
  PICTURES,
  getLeague,
} from "@esp-group-one/types/build/tests/helpers/utils";
// eslint-disable-next-line import/no-named-as-default -- WHYYY
import userEvent from "@testing-library/user-event";
import { type LeagueCreation, ObjectId, Sport } from "@esp-group-one/types";
import { IDS } from "@esp-group-one/test-helpers-base";
import { act, render } from "@testing-library/react";
import { MockAPI, wait } from "../../helpers/utils";
import { PageTester, base64ToWebP } from "../helpers";
import { NewLeaguePage } from "../../../src/pages/league/new";
import { mockRouting } from "../../__meta__";

test("Successful interaction", async () => {
  const { useNavigate } = await mockRouting();
  const navFn = jest.fn();
  useNavigate.mockImplementation(() => navFn);

  const EXPECTED_LEAGUE: LeagueCreation = {
    name: "Shuttlin' Around",
    picture: PICTURES[0],
    private: true,
    sport: Sport.Badminton,
  };

  const MockedAPI = MockAPI({
    league: () => ({
      create: (params) => {
        return Promise.resolve(
          getLeague({ _id: new ObjectId(IDS[0]), ...params }),
        );
      },
    }),
  });

  const comp = render(
    <PageTester route="/league/new">
      <MockedAPI>
        <NewLeaguePage />
      </MockedAPI>
    </PageTester>,
  );

  act(() => void 0);

  // 1. File Input
  const fileInput = comp.container.querySelector(
    `input[type="file"]`,
  ) as unknown as HTMLInputElement;

  const file = base64ToWebP(PICTURES[0]);
  await userEvent.upload(fileInput, file);
  await act(() => wait(100));

  // 2. Sport Select
  await act(async () => {
    await userEvent.selectOptions(
      comp.container.querySelector("select") as unknown as HTMLSelectElement,
      comp.getByText(/badminton/i),
    );
  });

  // 3. Name
  await userEvent.type(comp.getByPlaceholderText("Name"), EXPECTED_LEAGUE.name);
  act(() => void 0);

  // 4. Visibility (Keep the same, but go through all radios)

  await userEvent.click(
    comp.container.querySelector(
      `[name="visibility"][value="private"]`,
    ) as unknown as HTMLInputElement,
  );
  act(() => void 0);

  await userEvent.click(
    comp.container.querySelector(
      `[name="visibility"][value="public"]`,
    ) as unknown as HTMLInputElement,
  );
  act(() => void 0);

  // B. Press button.

  const submitBtn = comp.container.querySelector(
    `button[type="submit"]`,
  ) as unknown as HTMLButtonElement;

  await userEvent.click(submitBtn);

  await act(() => wait(10));

  expect(navFn).toHaveBeenCalledWith(`/league/${IDS[0]}`, expect.anything());
});

test("No profile pic", async () => {
  const EXPECTED_LEAGUE: LeagueCreation = {
    name: "Shuttlin' Around",
    picture: PICTURES[0],
    private: true,
    sport: Sport.Badminton,
  };

  const MockedAPI = MockAPI({
    league: () => ({
      create: (params) => {
        return Promise.resolve(
          getLeague({ _id: new ObjectId(IDS[0]), ...params }),
        );
      },
    }),
  });

  const comp = render(
    <PageTester route="/league/new">
      <MockedAPI>
        <NewLeaguePage />
      </MockedAPI>
    </PageTester>,
  );

  // 1. No File Input

  // 2. Sport Select
  await act(async () => {
    await userEvent.selectOptions(
      comp.container.querySelector("select") as unknown as HTMLSelectElement,
      comp.getByText(/badminton/i),
    );
  });

  // 3. Name
  await userEvent.type(comp.getByPlaceholderText("Name"), EXPECTED_LEAGUE.name);
  act(() => void 0);

  // 4. Visibility (Keep the same, but go through all radios)

  await userEvent.click(
    comp.container.querySelector(
      `[name="visibility"][value="private"]`,
    ) as unknown as HTMLInputElement,
  );
  act(() => void 0);

  await userEvent.click(
    comp.container.querySelector(
      `[name="visibility"][value="public"]`,
    ) as unknown as HTMLInputElement,
  );
  act(() => void 0);

  // B. Press button.

  const submitBtn = comp.container.querySelector(
    `button[type="submit"]`,
  ) as unknown as HTMLButtonElement;

  await userEvent.click(submitBtn);
});
