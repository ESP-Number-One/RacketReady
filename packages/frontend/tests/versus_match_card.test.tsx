import { render } from "@testing-library/react";
import { VersusMatchCard } from "../src/components/versus_match_card";

/* Jest + React Guides: https://jestjs.io/docs/tutorial-react */

// Group of related tests.
describe("VersusMatchCard", () => {
  //     \/ Describe individual test here.
  test("Correct scores displayed", () => {
    const score = {
      Lara: 10,
      Hugo: 1,
    };

    const component = render(<VersusMatchCard score={score} />);
    expect(component.container).toBeInTheDocument();

    const matchCard = component.container.children.item(0) as HTMLElement;
    expect(matchCard).not.toBeNull();

    const div1 = matchCard.children.item(0) as HTMLElement;
    const div2 = matchCard.children.item(2) as HTMLElement;

    expect(div1).not.toBeNull();
    expect(div2).not.toBeNull();

    const p11 = div1.children.item(0);
    expect(p11).not.toBeNull();
    expect(p11!.textContent).toBe("Lara");
    const p12 = div1.children.item(1);
    expect(p12).not.toBeNull();
    expect(p12!.textContent).toBe("10");

    const p21 = div2.children.item(0);
    expect(p21).not.toBeNull();
    expect(p21!.textContent).toBe("Hugo");
    const p22 = div2.children.item(1);
    expect(p22).not.toBeNull();
    expect(p22!.textContent).toBe("1");
  });

  test("Correct winner", () => {
    const score = {
      Lara: 10,
      Hugo: 1,
    };

    const component = render(<VersusMatchCard score={score} />);
    expect(component.container).toBeInTheDocument();

    const matchCard = component.container.children.item(0) as HTMLElement;
    expect(matchCard).not.toBeNull();

    const div1 = matchCard.children.item(0) as HTMLElement;
    const div2 = matchCard.children.item(2) as HTMLElement;
    expect(div1).not.toBeNull();
    expect(div2).not.toBeNull();

    expect(div1!.classList.contains("bg-p-green-200")).toBe(true);
    expect(div2!.classList.contains("bg-p-green-200")).toBe(false);
  });

  test("Correct handling of equal scores", () => {
    const score = {
      Hugo1: 1,
      Hugo2: 1,
    };

    const component = render(<VersusMatchCard score={score} />);
    expect(component.container).toBeInTheDocument();

    const matchCard = component.container.children.item(0) as HTMLElement;
    expect(matchCard).not.toBeNull();

    const div1 = matchCard.children.item(0) as HTMLElement;
    const div2 = matchCard.children.item(2) as HTMLElement;
    expect(div1).not.toBeNull();
    expect(div2).not.toBeNull();

    expect(div1!.classList.contains("bg-p-green-200")).toBe(true);
    expect(div2!.classList.contains("bg-p-green-200")).toBe(true);
  });
});
