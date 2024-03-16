import { cleanup, render } from "@testing-library/react";
import { ProgressBar } from "../../src/components/progress_bar";

afterEach(cleanup);

it("renders without crashing", () => {
  render(<ProgressBar currentProgress={1} pageNames={["Page 1"]} />);
});

it("renders the correct page name", () => {
  let count = 1;
  let pageNames = ["Page 1"];
  while (count < 20) {
    const progressBar = render(
      <ProgressBar currentProgress={count} pageNames={pageNames} />,
    );
    const barText = `Page ${count}`;
    expect(progressBar.getByText(barText)).toBeDefined();
    count++;
    pageNames = pageNames.concat(`Page ${count}`);
  }
});

it("correctly clamps progress between 1 and pageNames.length", () => {
  let count = -4;
  const pageNames = ["A", "B", "C", "D", "E", "F", "G"];
  while (count < 20) {
    const { getByText } = render(
      <ProgressBar currentProgress={count} pageNames={pageNames} />,
    );
    expect(
      getByText(pageNames[Math.min(Math.max(1, count), pageNames.length) - 1]),
    ).toBeDefined();
    count++;
    cleanup();
  }
});
