import type { ReactNode, JSX } from "react";
import { render } from "@testing-library/react";
import { Slot } from "../../../src/lib/slotting";

describe("Slotting Pattern", () => {
  function Starter({
    type,
  }: {
    type?: string;
    children?: ReactNode;
  }): JSX.Element {
    return <p data-role="starter">I am a {type}!</p>;
  }

  function Content({ children }: { children: ReactNode }): JSX.Element {
    return children as JSX.Element;
  }

  function Ender({ type }: { type?: string }): JSX.Element {
    return <p data-role="ender">I am a {type}!</p>;
  }

  function SlotParent({
    children: childs,
  }: {
    children: ReactNode | ReactNode[];
  }) {
    const children = Slot.children(childs);

    const starter = Slot.find(children, Starter);
    const content = Slot.find(children, Content);
    const ender = Slot.find(children, Ender);

    return (
      <>
        {starter !== undefined ? (
          <div data-role="starter">{starter}</div>
        ) : null}
        {content !== undefined ? (
          <div data-role="content">{content}</div>
        ) : null}
        {ender !== undefined ? <div data-role="ender">{ender}</div> : null}
      </>
    );
  }

  test("Slotting in order", () => {
    const outOfOrder1 = render(
      <SlotParent>
        <Ender />
        <Content>Apple</Content>
        <Starter />
      </SlotParent>,
    );

    const el = outOfOrder1.container.childNodes;
    expect(el.length).toBe(3); // 3 Elements
    expect([...el].map((e) => (e as HTMLElement).dataset.role)).toEqual([
      "starter",
      "content",
      "ender",
    ]);
  }); // In order.

  test("Optional slots", () => {
    const optionalSlots = render(
      <SlotParent>
        <Ender />
        <Content>Apple</Content>
      </SlotParent>,
    );

    const el = optionalSlots.container.childNodes;
    expect(el.length).toBe(2); // 2 Elements
    expect([...el].map((e) => (e as HTMLElement).dataset.role)).toEqual([
      "content",
      "ender",
    ]); // In correct order.
  });
});
