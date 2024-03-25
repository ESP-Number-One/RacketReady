import { act, render } from "@testing-library/react";
import { getUser } from "@esp-group-one/types/build/tests/helpers/utils";
import userEvent from "@testing-library/user-event";
import { mockRouting } from "../../__meta__";
import { MockAPI } from "../../helpers/utils";
import { PageTester } from "../helpers";
import { YourProfile } from "../../../src/pages/me";

const navFn = jest.fn();
test("Success Render", async () => {
  const { useNavigate } = await mockRouting();
  useNavigate.mockReturnValue(navFn);

  const MockedAPI = MockAPI({
    user: () => ({
      me: () =>
        Promise.resolve(
          getUser({
            name: "Test Bot",
            rating: {
              1: 0,
              2: 0,
              3: 0,
              4: 0,
              5: 1,
            },
          }),
        ),
    }),
  });

  const comp = render(
    <PageTester route="/me">
      <MockedAPI>
        <YourProfile />
      </MockedAPI>
    </PageTester>,
  );

  await act(() => Promise.resolve());

  await act(async () => {
    await userEvent.click(comp.getByText("Calendar"));
  });

  expect(navFn).toHaveBeenCalledWith("/me/availability", expect.anything());

  await act(async () => {
    await userEvent.click(comp.getByText("Edit Profile"));
  });

  expect(navFn).toHaveBeenCalledWith("/me/edit", expect.anything());

  await act(async () => {
    await userEvent.click(comp.getByText("Settings"));
  });

  expect(navFn).toHaveBeenCalledWith("/settings", expect.anything());
});

test("API Failure", async () => {
  const errStr = "API ERROR!";
  const MockedAPI = MockAPI({
    user: () => ({
      me: () => Promise.reject(new Error(errStr)),
    }),
  });

  const comp = render(
    <PageTester route="/me">
      <MockedAPI>
        <YourProfile />
      </MockedAPI>
    </PageTester>,
  );

  await act(() => Promise.resolve());

  expect(comp.container).toHaveTextContent(errStr);
});
