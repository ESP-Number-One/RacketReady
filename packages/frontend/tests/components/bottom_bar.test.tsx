import { render } from "@testing-library/react";
import type { To } from "react-router-dom";
import { BottomBar } from "../../src/components/bottom_bar.tsx";
import { mockLinks } from "../helpers/mock.ts";

jest.mock("../../src/state/nav");
jest.mock("react-router-dom");
const mockedUseNav = mockLinks();

describe("BottomBar", () => {
  test("highlight current page", () => {
    const component = render(<BottomBar activePage={"profile"} />);
    const profile = component.container.children.item(0)?.children.item(3);
    expect(profile).not.toBeNull();
    expect(profile?.classList.contains("text-p-blue")).toBe(true);
  });

  test("Clicking works", () => {
    const history: To[] = [];
    mockedUseNav.mockReturnValue((page: To) => {
      history.push(page);
      return undefined;
    });
    const component = render(<BottomBar activePage={"profile"} />);
    expect(component.container).toBeInTheDocument();
    const buttons = component.container.querySelectorAll<HTMLLinkElement>("a");
    buttons.forEach((b) => {
      b.click();
    });
    expect(history).toStrictEqual(["/", "/search", "/leagues", "/me"]);
  });
});
