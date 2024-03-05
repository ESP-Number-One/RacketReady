import { Slot } from "../../../src/lib/slotting";

describe("Slotting Utilities", () => {
  const TestA = (_props: { class: string }) => {
    return <></>;
  };
  const TestB = (_props: { type: string }) => {
    return <></>;
  };
  const TestC = (_props: { category: string }) => {
    return <></>;
  };

  const singleton = <TestA class="apple" />;
  const multiple = [
    <TestA class="apple" key="A" />,
    <TestB type="apple" key="B" />,
  ];

  test("Children Pluralisation", () => {
    expect(Slot.children(singleton)).toEqual([singleton]);
    expect(Slot.children(multiple)).toBe(multiple);
  });

  test("Find child of type", () => {
    expect(Slot.find(multiple, TestA)).not.toBeNull();
    expect(Slot.find(multiple, TestC)).toBeUndefined();
  });
});
