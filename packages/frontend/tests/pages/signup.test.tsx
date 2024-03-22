import { IDS } from "@esp-group-one/test-helpers-base";
import { PICTURES } from "@esp-group-one/types/build/tests/helpers/utils";
import {
  act,
  getByPlaceholderText,
  getByText,
  render,
  waitFor,
} from "@testing-library/react";
import type { User, UserCreation } from "@esp-group-one/types";
import { AbilityLevel, ObjectId, Sport } from "@esp-group-one/types";
// eslint-disable-next-line import/no-named-as-default -- WHYYY
import userEvent from "@testing-library/user-event";
import type { UserAPIClient } from "@esp-group-one/api-client/build/src/sub/user";
import moment from "moment";
import { MockAPI, wait } from "../helpers/utils";
import { SignUp } from "../../src/pages/signup";
import { mockRouting } from "../__meta__";
import { PageTester, base64ToWebP } from "./helpers";

const createFn = jest.fn<Promise<User>, [UserCreation], UserAPIClient>(
  (creation) => {
    return Promise.resolve({
      ...creation,
      _id: new ObjectId(IDS[0]),
      sports: [],
      leagues: [],
      availability: [],
      rating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    });
  },
);

const meFn = jest.fn<Promise<User>, [], UserAPIClient>(() =>
  Promise.resolve({
    _id: new ObjectId(IDS[0]),
    name: "Apples",
    description: "",
    profilePicture: PICTURES[0],
    email: "test.bot@sammy99jsp.dev",
    sports: [],
    leagues: [],
    availability: [],
    rating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  }),
);

const addSportsFn = jest.fn(() => Promise.resolve());

const addAvailabilityFn = jest.fn(() => Promise.resolve());

test("Step 1", async () => {
  const MockedAPI = MockAPI({
    user: () => ({
      create: createFn,
      me: () => Promise.reject(new Error("User not found.")),
    }),
  });

  const comp = render(
    <PageTester route="/signup">
      <MockedAPI>
        <SignUp />
      </MockedAPI>
    </PageTester>,
  );
  const outer = comp.container;

  await waitFor(() => {
    expect(comp.getByText("Ready!")).toBeInTheDocument();
  });

  const page = outer.children.item(0) as HTMLDivElement;

  // Phase 1.
  expect(page).toHaveTextContent("General");

  const fileInput = page.querySelector(
    `input[type="file"]`,
  ) as unknown as HTMLInputElement;

  const file = base64ToWebP(PICTURES[0]);
  await userEvent.upload(fileInput, file);
  await wait(100);

  // Cheeky early submit.
  await userEvent.click(getByText(page, "Ready!"));
  await act(async () => Promise.resolve());

  act(() => void 0);

  await userEvent.type(getByPlaceholderText(page, "Name"), "Test Bot");

  act(() => void 0);

  await userEvent.type(
    getByPlaceholderText(page, "Email"),
    "test.bot@sammy99jsp.dev",
  );
  act(() => void 0);

  await userEvent.type(
    getByPlaceholderText(page, "Description"),
    "Oh, oh, oh! I love incarceration! I could lock up a platoon!",
  );
  act(() => void 0);

  await userEvent.click(getByText(page, "Ready!"));
  await act(async () => Promise.resolve());

  expect(createFn).toHaveBeenCalled();
});

test("Step 1 Fail", async () => {
  const MockedAPI = MockAPI({
    user: () => ({
      create: createFn,
      me: () => Promise.reject(new Error("User not found.")),
    }),
  });

  const comp = render(
    <PageTester route="/signup">
      <MockedAPI>
        <SignUp />
      </MockedAPI>
    </PageTester>,
  );
  const outer = comp.container;

  await waitFor(() => {
    expect(comp.getByText("Ready!")).toBeInTheDocument();
    expect(comp.container.querySelector("form")).not.toBeNull();
  });

  const page = outer.children.item(0) as HTMLDivElement;

  // Phase 1.
  expect(page).toHaveTextContent("General");

  // Attempt to submit without anything.
  (outer.querySelector("form") as unknown as HTMLFormElement).submit();

  await act(async () => Promise.resolve());
});

test("Step 2", async () => {
  const MockedAPI = MockAPI({
    user: () => ({
      create: createFn,
      me: meFn,
      addSports: addSportsFn,
    }),
  });

  const comp = render(
    <PageTester route="/signup">
      <MockedAPI>
        <SignUp />
      </MockedAPI>
    </PageTester>,
  );
  const outer = comp.container;

  await waitFor(() => {
    expect(comp.getByText("Set!")).toBeInTheDocument();
  });

  (outer.querySelector("form") as unknown as HTMLFormElement).submit();

  await userEvent.selectOptions(
    outer.querySelector("select") as unknown as HTMLSelectElement,
    "badminton",
  );

  act(() => void 0);

  await userEvent.selectOptions(
    getByText(outer, "Advanced").parentElement as unknown as HTMLSelectElement,
    "Advanced",
  );

  act(() => void 0);

  await userEvent.click(getByText(outer, "Set!"));

  act(() => void 0);

  expect(addSportsFn).toHaveBeenCalled();
});

test("Step 3", async () => {
  const { useNavigate } = await mockRouting();
  const nav = jest.fn();
  useNavigate.mockImplementation(() => {
    return nav;
  });

  meFn.mockImplementation(() =>
    Promise.resolve({
      _id: new ObjectId(IDS[0]),
      name: "Apples",
      description: "",
      profilePicture: PICTURES[0],
      email: "test.bot@sammy99jsp.dev",
      sports: [{ sport: Sport.Badminton, ability: AbilityLevel.Beginner }],
      leagues: [],
      availability: [],
      rating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    }),
  );

  const MockedAPI = MockAPI({
    user: () => ({
      me: meFn,
      addSports: addSportsFn,
      addAvailability: addAvailabilityFn,
    }),
  });

  const comp = render(
    <PageTester route="/signup">
      <MockedAPI>
        <SignUp />
      </MockedAPI>
    </PageTester>,
  );

  await waitFor(() => {
    expect(comp.getByText("Start")).toBeInTheDocument();
  });

  (comp.container.querySelector("form") as unknown as HTMLFormElement).submit();

  const date = moment();

  // Date
  await userEvent.type(
    comp.container.querySelector(
      `input[type="date"]`,
    ) as unknown as HTMLInputElement,
    date.format("YYYY-MM-DD"),
  );

  act(() => void 0);

  // Start time.
  await userEvent.type(
    comp.container.querySelector(`#start`) as unknown as HTMLInputElement,
    date.format("HH:mm"),
  );

  act(() => void 0);

  // End time.
  await userEvent.type(
    comp.container.querySelector(`#end`) as unknown as HTMLInputElement,
    date.add(2, "hours").format("HH:mm"),
  );

  act(() => void 0);

  await userEvent.click(comp.getByLabelText("Reoccurring"));

  act(() => void 0);

  // Choose recurring.
  (comp.container.querySelector("form") as unknown as HTMLFormElement).submit();

  act(() => void 0);

  await userEvent.type(
    comp.container.querySelector(
      `input[type="number"]`,
    ) as unknown as HTMLInputElement,
    "3",
  );

  act(() => void 0);

  (comp.container.querySelector("form") as unknown as HTMLFormElement).submit();

  await userEvent.selectOptions(
    comp.container.querySelector(`select`) as unknown as HTMLSelectElement,
    "days",
  );

  (comp.container.querySelector("form") as unknown as HTMLFormElement).submit();
  act(() => void 0);

  // Press "Add" button.

  await userEvent.click(comp.getByText("Add"));

  act(() => void 0);

  expect(addAvailabilityFn).toHaveBeenCalled();

  // Expect to be redirected to `/`.
  await userEvent.click(comp.getByText("Go!"));
  act(() => void 0);

  expect(nav).toHaveBeenCalled();
});
