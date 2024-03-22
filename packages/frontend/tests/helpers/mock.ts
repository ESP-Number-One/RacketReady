import { asFuncMock } from "@esp-group-one/test-helpers-base";
import type { Location } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useViewNav } from "../../src/state/nav";

export function mockLinks(page = "", history?: string[]) {
  // jest.mock("react-router-dom", () => ({
  //   useLocation: () =>
  //     ({
  //       page,
  //       state: history ? { from: history } : null,
  //     }) as unknown as Location<any>,
  // }));

  const mockedUseLocation = asFuncMock(useLocation);
  mockedUseLocation.mockReturnValue({
    page,
    state: history ? { from: history } : null,
  } as unknown as Location);

  const mockedUseNav = asFuncMock(useViewNav);
  mockedUseNav.mockReturnValue(() => undefined);

  return { mockedUseNav, mockedUseLocation };
}
