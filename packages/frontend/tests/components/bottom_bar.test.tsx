import { cleanup, render } from "@testing-library/react";
import type { To } from "react-router-dom";
import { BottomBar } from "../../src/components/bottom_bar.tsx";
import { mockLinks } from "../helpers/mock.ts";

jest.mock("../../src/state/nav");
jest.mock("react-router-dom");
const { mockedUseNav } = mockLinks();

afterAll(cleanup);

describe("BottomBar", () => {
  test("highlight current page", () => {
    const pages: ("home" | "search" | "leagues" | "profile")[] = [
      "home",
      "search",
      "leagues",
      "profile",
    ];

    pages.forEach((pageName, i) => {
      const component = render(<BottomBar activePage={pageName} />);

      for (let j = 0; j < 4; j++) {
        const profile = component.container.children.item(0)?.children.item(j);
        expect(profile).not.toBeNull();
        expect(profile?.classList.contains("text-p-blue")).toBe(i === j);
      }
    });
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
