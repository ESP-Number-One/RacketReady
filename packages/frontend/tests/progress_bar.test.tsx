import { render } from "@testing-library/react";
import { ProgressBar } from "../src/components/progress_bar";

it("renders without crashing", () => {
  render(<ProgressBar progress={1} pageNames={["Page 1"]} />);
});

it("renders the correct page name", () => {
  let count = 1;
  let pageNames = ["Page 1"];
  while (count < 20) {
    const progressBar = render(
      <ProgressBar progress={count} pageNames={pageNames} />,
    );
    const barText = `Page ${count}`;
    expect(progressBar.getByText(barText)).toBeDefined();
    count++;
    pageNames = pageNames.concat(`Page ${count}`);
  }
});
