import { act, prettyDOM, render, waitFor } from "@testing-library/react";
import { getUser } from "@esp-group-one/types/build/tests/helpers/utils";
import { IDS } from "@esp-group-one/test-helpers-base";
import { AbilityLevel, ObjectId, Sport } from "@esp-group-one/types";
import { MockAPI } from "../../helpers/utils";
import { PageTester } from "../helpers";
import { NewMatchPage } from "../../../src/pages/match/new";
import userEvent from "@testing-library/user-event";

test("Error", async () => {
  const MockedAPI = MockAPI({});

  const comp = render(
    <PageTester route="/match/new">
      <MockedAPI>
        <NewMatchPage />
      </MockedAPI>
    </PageTester>,
  );

  await waitFor(() => {
    expect(comp.container).not.toHaveTextContent(/loading/i);
  });
});

test("Render", async () => {
  const MockedAPI = MockAPI({
    user: () => ({
      me: () =>
        Promise.resolve(
          getUser({
            _id: new ObjectId(IDS[0]),
            name: "Bot A",
            description: "I love oranges!",
            sports: [
              { sport: Sport.Badminton, ability: AbilityLevel.Advanced },
            ],
          }),
        ),
      find: () =>
        Promise.resolve([
          getUser({
            _id: new ObjectId(IDS[1]),
            name: "Bot B",
            description: "I love apples!",
            sports: [
              { sport: Sport.Badminton, ability: AbilityLevel.Advanced },
              { sport: Sport.Squash, ability: AbilityLevel.Beginner },
            ],
          }),
        ]),
    }),
  });

  const comp = render(
    <PageTester route="/match/new">
      <MockedAPI>
        <NewMatchPage />
      </MockedAPI>
    </PageTester>,
  );

  await waitFor(() => {
    expect(comp.container).not.toHaveTextContent(/loading/i);
  });

  await userEvent.click(comp.getByText(/submit/i));

  // Select Sport.
  await userEvent.selectOptions(
    comp.container.querySelector("select")!,
    "Badminton",
  );
  act(() => void 0);

  // Enter date
  await userEvent.type(
    comp.container.querySelector(`[type="date"]`)!,
    "2024-03-29",
  );
  act(() => void 0);

  await userEvent.type(comp.container.querySelector(`[type="time"]`)!, "10:10");

  console.log(prettyDOM(comp.container));
});
