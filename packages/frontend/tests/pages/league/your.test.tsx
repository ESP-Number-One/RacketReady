import { act, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  getLeague,
  getMatch,
} from "@esp-group-one/types/build/tests/helpers/utils";
import type { ObjectId } from "@esp-group-one/types";
import { MockAPI, wait } from "../../helpers/utils";
import { PageTester } from "../helpers";
import { YourLeagues } from "../../../src/pages/league/your";
import { mockRouting } from "../../__meta__";

test("Render", async () => {
  const { useNavigate } = await mockRouting();
  const navFn = jest.fn();
  useNavigate.mockReturnValueOnce(navFn);

  const MockedAPI = MockAPI({
    league: () => ({
      find: () => Promise.resolve([getLeague({})]),
    }),
    match: () => ({
      find: ({ query: { league } = { league: undefined } }) =>
        Promise.resolve([getMatch({ league: league as ObjectId })]),
    }),
  });

  const comp = render(
    <PageTester route="/leagues">
      <MockedAPI>
        <YourLeagues />
      </MockedAPI>
    </PageTester>,
  );

  await act(() => wait(100));
  await userEvent.click(comp.getByText("Discover more").parentElement!);

  act(() => void 0);

  expect(navFn).toHaveBeenCalledWith("/leagues/discover", expect.anything());
});
