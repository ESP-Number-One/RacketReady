import { cleanup, render } from "@testing-library/react";
import { BackLink } from "../../src/components/back_link";
import { mockRouting } from "../__meta__";

afterAll(cleanup);

describe("back link", () => {
  test("default link", async () => {
    const Routing = await mockRouting();

    Routing.useLocation.mockReturnValue({
      state: 0,
      key: "0",
      pathname: "",
      search: "",
      hash: "",
    });

    Routing.useNavigate.mockImplementation(() => {
      return () => {
        void 0;
      };
    });

    const component = render(<BackLink defaultLink="/default" />);

    expect(component.container).toBeInTheDocument();
    const link = component.container.querySelector("a");
    expect(link).not.toBeNull();
    if (link) expect(link.href).toBe("http://localhost/default");
  });

  test("previous link", async () => {
    const Routing = await mockRouting();

    Routing.useLocation.mockReturnValue({
      state: { from: ["/something"] },
      key: "0",
      pathname: "",
      search: "",
      hash: "",
    });

    Routing.useNavigate.mockImplementation(() => {
      return () => {
        void 0;
      };
    });

    const component = render(<BackLink defaultLink="/default" />);

    expect(component.container).toBeInTheDocument();
    const link = component.container.querySelector("a");
    expect(link).not.toBeNull();
    if (link) expect(link.href).toBe("http://localhost/something");
  });
});
