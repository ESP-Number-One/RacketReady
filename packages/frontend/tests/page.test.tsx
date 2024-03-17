import { asFuncMock } from "@esp-group-one/test-helpers-base";
import { render } from "@testing-library/react";
import { Page } from "../src/components/page";
import { Header } from "../src/components/page/header";
import { useViewNav } from "../src/state/nav.ts";

jest.mock("../src/state/nav");

const mockedUseNav = asFuncMock(useViewNav);

describe("Page", () => {
  test("Slotting Structure", () => {
    const thing = render(
      <Page>
        <Page.Header>Header</Page.Header>
        <Page.Body>Body</Page.Body>
        <Page.Footer>Footer</Page.Footer>
      </Page>,
    );

    expect(thing.container.childNodes.length).toBe(1);
    expect(thing.container.childNodes.item(0).childNodes.length).toBe(3);
  });
  test("Minimal", () => {
    mockedUseNav.mockReturnValue(() => void 0);

    const thing = render(
      <Page>
        <Page.Body>Body</Page.Body>
      </Page>,
    );

    expect(thing.container.childNodes.length).toBe(1);
    expect(thing.container.childNodes.item(0).childNodes.length).toBe(2);
  });

  test("Empty", () => {
    mockedUseNav.mockReturnValue(() => void 0);

    const thing = render(<Page>A</Page>);

    expect(thing.container.childNodes.length).toBe(1);
    expect(thing.container.childNodes.item(0).childNodes.length).toBe(2); // Content still there.
    expect(thing.container.innerText).toBeFalsy(); // No text, since no <Page.Body />
  });

  test("Components", () => {
    const header = render(<Page.Header>Apples</Page.Header>);
    expect(header.container.childNodes.length).toEqual(1);

    const body = render(<Page.Body>Apples</Page.Body>);
    expect(
      (body.container.childNodes.item(0) as HTMLElement).innerHTML,
    ).toEqual("Apples");

    const footer = render(<Page.Footer>Apples</Page.Footer>);
    expect(footer.container.childNodes.length).toEqual(1);
  });
});

describe("Header", () => {
  test("Everything", () => {
    const header = render(
      <Page.Header>
        <Header.Back defaultLink="/" />
        <Header.Title>Hello!</Header.Title>
        <Header.Right>Right-side!</Header.Right>
      </Page.Header>,
    );

    expect(header.container.childNodes.length).toBe(3);

    expect([
      ...(header.container.childNodes.item(0) as HTMLElement).classList,
    ]).toEqual(["absolute", "left-0", "h-full"]); // First element -> Icon.

    expect([
      ...(header.container.childNodes.item(1) as HTMLElement).classList,
    ]).toEqual(["flex", "flex-grow", "w-full", "justify-center"]); // Second element -> Body.

    expect([
      ...(header.container.childNodes.item(2) as HTMLElement).classList,
    ]).toEqual(["absolute", "right-0", "h-full"]);
  }); // Third element -> Icon.
});
