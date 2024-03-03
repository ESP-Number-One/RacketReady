import { render, screen } from "@testing-library/react";
import { Sport } from "@esp-group-one/types";
import { userEvent } from "@testing-library/user-event";
import { SelectSport } from "../src/components/select_sports";

/* Jest + React Guides: https://jestjs.io/docs/tutorial-react */

// Group of related tests.
describe("SelectSport", () => {
  //     \/ Describe individual test here.
  test("Basics + State changes", () => {
    // Here's how to test a JSX component: you render it with the test renderer.
    const component = render(
      <SelectSport
        sports={[Sport.Tennis, Sport.Badminton]}
        currentSport={Sport.Tennis}
      />,
    );

    // check element is rendered
    expect(component.container).toBeInTheDocument();

    //check the dropdown has the correct starting text
    const dropdownSport = screen.getByText("Tennis");
    expect(dropdownSport).toBeInTheDocument();

    // Check text updates when selected
    userEvent.selectOptions(component, "Badminton");
    const dropdown = screen.getByText("Badminton");
    expect(dropdown).toBeInTheDocument();
  });
});
