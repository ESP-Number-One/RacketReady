import { render, screen } from "@testing-library/react";
import { Sport } from "@esp-group-one/types";
import { userEvent } from "@testing-library/user-event";
import { SelectSport } from "../../src/components/select_sports";

describe("SelectSport", () => {
  test("Change colour on select", async () => {
    const user = userEvent.setup();

    const component = render(
      <SelectSport
        sports={[Sport.Tennis, Sport.Badminton]}
        currentSport={Sport.Tennis}
      />,
    );

    expect(component.container).toBeInTheDocument();

    /**
     * ```html
     * <select ...>
     *   ...
     * </select>
     * ```
     */
    const intComp = component.container.children[0] as HTMLSelectElement;

    // Check the dropdown has the correct starting text
    const dropdownSport = screen.getByText("Tennis");
    expect(dropdownSport).toBeInTheDocument();

    const dropdown = screen.getByText("Badminton");
    expect(dropdown).toBeInTheDocument();

    expect(intComp.classList).toContain("bg-tennis");

    // Check text updates when selected
    await user.selectOptions(intComp, "Badminton");
    expect(intComp.value).toBe(Sport.Badminton);
    expect(intComp.classList).toContain("bg-badminton");
    expect(intComp.classList).not.toContain("bg-tennis");
  });
});
