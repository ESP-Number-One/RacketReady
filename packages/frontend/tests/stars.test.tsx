import { fireEvent, render } from "@testing-library/react";
import { Stars } from "../src/components/stars";
import { track } from "./helpers/utils";

/* Jest + React Guides: https://jestjs.io/docs/tutorial-react */

// Group of related tests.
describe("Stars", () => {
  //     \/ Describe individual test here.
  test("Basics + State changes", () => {
    // Since we don't use track() `rating` *does* change, but the HTML will not.
    let rating = 0;
    const setRating = (r: number) => {
      rating = r;
    };

    // Here's how to test a JSX component: you render it with the test renderer.
    const component = render(
      <Stars rating={0} onRatingChange={setRating} disabled={false} />,
    );

    expect(component.container).toBeInTheDocument();

    /**
     * ```html
     * <div className="space-x-2">
     *   <!-- . . Child buttons . . -->
     * </div>
     * ```
     */
    const starsContainer = component.container.children.item(0) as HTMLElement;
    expect(starsContainer).not.toBeNull();

    // Expect 5 stars button components.
    expect(starsContainer.childElementCount).toBe(5);

    // Click the the 2nd star (remember, 0-indexed).
    fireEvent.click(starsContainer.children.item(1) as HTMLElement);

    // Obviously, click on the 2nd star -> rating of 2 / 5.
    expect(rating).toBe(2);

    // Click the the 5th star.
    fireEvent.click(starsContainer.children.item(4) as HTMLElement);

    // Hopefully, a rating of 5 / 5.
    expect(rating).toBe(5);
  });

  test("UI Updates accordingly", () => {
    // To test what happens upon a state change, we need to
    // wrap our element in a special tracker.

    const StarsTracker = track(Stars);
    const component = render(
      <StarsTracker
        track="rating"
        callback="onRatingChange" // Prop that's a callback.
      >
        <Stars rating={0} onRatingChange={() => void 0} disabled={false} />
      </StarsTracker>,
    );

    const starsContainer = component.container.children.item(0) as HTMLElement;

    // Click the 2nd button.
    fireEvent.click(starsContainer.children.item(1) as HTMLElement);

    // Expect the 3rd, 4th, and 5th stars to have the outlined icon.
    [2, 3, 4].forEach((i) => {
      const icon = starsContainer.children.item(i)?.children.item(0);
      expect(icon).toHaveAttribute("data-prefix", "far");
    });

    // Click the last (5th) button.
    fireEvent.click(starsContainer.children.item(4) as HTMLElement);

    // Expect all the buttons to have solid (filled) stars.
    [0, 1, 2, 3, 4].forEach((i) => {
      const icon = starsContainer.children.item(i)?.children.item(0);
      expect(icon).toHaveAttribute("data-prefix", "fas");
    });
  });

  test("Default value test", () => {
    // Testing the disabled.
    const setRating = (_: number) => {
      // Nothing.
    };

    const component = render(<Stars rating={0} onRatingChange={setRating} />);

    expect(component.container).toBeInTheDocument();
  });
});
