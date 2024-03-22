import { Sport } from "@esp-group-one/types";
import { cleanup, render } from "@testing-library/react";
import { Tag } from "../../src/components/tags";

afterAll(cleanup);

describe("tags", () => {
  describe("correct sport colours", () => {
    for (const sport of Object.values(Sport)) {
      test(sport, () => {
        const component = render(<Tag sportName={sport} />);
        expect(component.container).toBeInTheDocument();
        expect(
          component.container.children[0].classList.contains(`bg-${sport}`),
        ).toBe(true);
      });
    }
  });

  describe("inactive", () => {
    for (const sport of Object.values(Sport)) {
      test(sport, () => {
        const component = render(<Tag sportName={sport} active={false} />);

        expect(component.container).toBeInTheDocument();
        /**
         * <div className="inline-block bg-... ...">
         *   ...
         * </div>
         */
        const tag = component.container.children[0];

        expect(tag.classList.contains(`bg-${sport}`)).toBe(false);
        expect(tag.classList.contains(`bg-slate-600`)).toBe(true);
      });
    }
  });
});
