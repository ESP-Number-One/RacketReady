import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { userEvent } from "@testing-library/user-event";
import { ProfilePicturePicker } from "../../../src/components/form/profile_picture";

describe("ProfilePicturePicker", () => {
  test("displays selected image", async () => {
    const user = userEvent.setup();

    const expectedVals = ["(⌐□_□)", ""];
    const handleChange = (val: string): void => {
      expect(val).toBe(expectedVals.shift());
    };

    const component = render(<ProfilePicturePicker onChange={handleChange} />);
    expect(component.container).toBeInTheDocument();

    /**
     * ```html
     * <div ...>
     *    <div ...>
     *       <label ...>...</label>
     *    </div>
     * </div>
     * ```
     */
    const container = component.container.children[0];

    // Check input is there by default
    const input = container.querySelector("input");
    expect(input).not.toBeNull();
    const file = new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" });

    if (input) await user.upload(input, file);

    // Check image has now appeared
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      "src",
      expect.stringContaining("data:image/png;base64"),
    );

    if (img) await user.click(img);

    // Check we have gone back to the input
    expect(img).not.toBeInTheDocument();

    const newInput = container.querySelector("input");
    expect(newInput).not.toBeNull();
  });
});
