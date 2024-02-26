import { cleanup, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { CardList } from "../src/components/card_list";

afterEach(cleanup);

const mockNextPage = jest.fn((pageNum: number) => {
  return new Promise<ReactNode[]>((res) => {
    if (pageNum > 20) {
      res([]);
    } else {
      res(
        new Array(20).map((_, index) => {
          return (
            <div data-testid={`card-${index}`} key={`card-${index}`}>{`Card ${
              index + 1
            }`}</div>
          );
        }),
      );
    }
  });
});

it("should render without crashing", () => {
  render(<CardList nextPage={mockNextPage} />);
});
