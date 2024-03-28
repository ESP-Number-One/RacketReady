import { act, render, waitFor } from "@testing-library/react";
import { getUser } from "@esp-group-one/types/build/tests/helpers/utils";
import userEvent from "@testing-library/user-event";
import { PageTester } from "../helpers";
import { MockAPI } from "../../helpers/utils";
import { SetAvailability } from "../../../src/pages/me/availability";

test("Render", async () => {
  const availFn = jest.fn();
  const MockedAPI = MockAPI({
    user: () => ({
      me: () =>
        Promise.resolve(
          getUser({
            name: "Apples for sale",
            availability: [],
          }),
        ),
      addAvailability: availFn,
    }),
  });

  const comp = render(
    <PageTester route="/me/availability">
      <MockedAPI>
        <SetAvailability />
      </MockedAPI>
    </PageTester>,
  );

  console.log(comp);
  await waitFor(() => {
    expect(comp.container).not.toHaveTextContent(/loading/i);
  });

  await userEvent.type(
    comp.container.querySelector(`[type="date"]`)!,
    "2024-10-10",
  );
  act(() => void 0);

  await userEvent.type(comp.container.querySelector("#start")!, "12:21");
  act(() => void 0);

  await userEvent.type(comp.container.querySelector("#end")!, "13:21");
  act(() => void 0);

  await userEvent.click(comp.getByLabelText(/reoccurring/i));
  act(() => void 0);

  await userEvent.type(
    comp.container.querySelector(`[type="number"][placeholder="0"]`)!,
    "3",
  );
  act(() => void 0);

  await userEvent.selectOptions(
    comp.container.querySelector(`select`)!,
    "days",
  );
  act(() => void 0);

  await userEvent.click(comp.getByLabelText(/one time/i));
  act(() => void 0);

  await userEvent.click(comp.getByText(/submit/i));
});

test("Error", async () => {
  const MockedAPI = MockAPI({
    user: () => ({
      me: () => Promise.reject(new Error("Apples!")),
    }),
  });

  const comp = render(
    <PageTester route="/me/availability">
      <MockedAPI>
        <SetAvailability />
      </MockedAPI>
    </PageTester>,
  );

  await waitFor(() => {
    expect(comp.container).not.toHaveTextContent(/loading/i);
  });

  expect(comp.container).toHaveTextContent(/Apples!/i);
});
