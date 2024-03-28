import {
  PICTURES,
  getUser,
} from "@esp-group-one/types/build/tests/helpers/utils";
import { act, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockRouting } from "../../__meta__";
import { MockAPI, wait } from "../../helpers/utils";
import { PageTester, base64ToWebP } from "../helpers";
import { EditSports, EditUser } from "../../../src/pages/me/edit";

const navFn = jest.fn().mockImplementation(console.log);
const editFn = jest.fn().mockImplementation(() => Promise.resolve());
describe("EditUser", () => {
  test("Render", async () => {
    const { useNavigate } = await mockRouting();
    useNavigate.mockReturnValue(navFn);

    const BEFORE = {
      name: "Test Bot",
      email: "test.bot@sammy99jsp.dev",
      description: "I am a test bot!",
      profilePicture: "ab==",
    };

    const MockedAPI = MockAPI({
      user: () => ({
        me: () => Promise.resolve(getUser(BEFORE)),
        editMe: editFn,
      }),
    });

    const comp = render(
      <PageTester route="/me/edit">
        <MockedAPI>
          <EditUser />
        </MockedAPI>
      </PageTester>,
    );

    await act(() => Promise.resolve());

    // Trigger "nothing changed".
    await userEvent.click(comp.getByText(/submit/i));
    expect(comp.container).toHaveTextContent(/Nothing has changed/i);

    // Edit picture.
    const fileInput: HTMLInputElement =
      comp.container.querySelector(`input[type="file"]`)!;

    const file = base64ToWebP(PICTURES[0]);
    await userEvent.upload(fileInput, file);
    await act(() => wait(100));

    // Edit name.
    await userEvent.clear(comp.getByPlaceholderText(/enter your name/i));
    await userEvent.type(
      comp.getByPlaceholderText(/enter your name/i),
      "David Cage",
    );

    // Edit email.
    await userEvent.clear(comp.getByPlaceholderText(/enter your email/i));
    await userEvent.type(
      comp.getByPlaceholderText(/enter your email/i),
      "new.email@sammy99jsp.dev",
    );

    // Edit description
    await userEvent.clear(comp.getByPlaceholderText(/give a description/i));
    await userEvent.type(
      comp.getByPlaceholderText(/give a description/i),
      "I have changed!",
    );

    await act(() => Promise.resolve());

    // Trigger "nothing changed".
    await userEvent.click(comp.getByText(/submit/i));
    expect(editFn).toHaveBeenCalled();
    expect(navFn).toHaveBeenCalledWith("/", expect.anything());
  });

  test("Error", async () => {
    const MockedAPI = MockAPI({
      user: () => ({
        me: () => Promise.reject(new Error("Apples!")),
      }),
    });

    const comp = render(
      <PageTester route="/me/edit">
        <MockedAPI>
          <EditUser />
        </MockedAPI>
      </PageTester>,
    );

    await act(() => Promise.resolve());

    expect(comp.container).toHaveTextContent("Apples!");
  });
});

describe("EditSports", () => {
  test("Render", async () => {
    const MockedAPI = MockAPI({
      user: () => ({
        me: () =>
          Promise.resolve(
            getUser({
              description: "Test Bot!",
              sports: [],
            }),
          ),
      }),
    });

    const comp = render(
      <PageTester route="/me/sports/edit">
        <MockedAPI>
          <EditSports />
        </MockedAPI>
      </PageTester>,
    );

    await act(() => Promise.resolve());

    await userEvent.click(comp.getByText(/submit/i));
  });

  test("Error", async () => {
    const MockedAPI = MockAPI({
      user: () => ({
        me: () => Promise.reject(new Error("Apples!")),
      }),
    });

    const comp = render(
      <PageTester route="/me/sports/edit">
        <MockedAPI>
          <EditSports />
        </MockedAPI>
      </PageTester>,
    );

    await act(() => Promise.resolve());

    expect(comp.container).toHaveTextContent("Apples!");
  });
});
