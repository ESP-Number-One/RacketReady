import { asFuncMock } from "@esp-group-one/test-helpers-base";
import { render } from "@testing-library/react";
import type { To } from "react-router-dom";
import { BottomBar } from "../../src/components/bottom_bar.tsx";
import { useViewNav } from "../../src/state/nav.ts";

jest.mock("../../src/state/nav");

const mockedUseNav = asFuncMock(useViewNav);

describe("BottomBar", () => {
  test("highlight current page", () => {
    const component = render(<BottomBar activePage={"profile"} />);
    const profile = component.container.children.item(0)?.children.item(3);
    expect(profile).not.toBeNull();
    expect(profile?.classList.contains("bg-p-blue")).toBe(true);
  });

  test("Clicking works", () => {
    const history: To[] = [];
    mockedUseNav.mockReturnValue((page: To) => {
      history.push(page);
      return undefined;
    });
    const component = render(<BottomBar activePage={"profile"} />);
    expect(component.container).toBeInTheDocument();
    const buttons =
      component.container.querySelectorAll<HTMLButtonElement>("button");
    buttons.forEach((b) => {
      b.click();
    });
    expect(history).toStrictEqual(["/", "/search", "/leagues", "/profile"]);
  });
});
