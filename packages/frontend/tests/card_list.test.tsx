import { cleanup, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { CardList } from "../src/components/card_list";

afterEach(cleanup);

class MockPaginator implements AsyncGenerator {
  #maxPage: number;
  #page: number;

  constructor(maxPage: number) {
    this.#maxPage = maxPage;
    this.#page = 0;
  }
  next(...args: [] | [number]): Promise<IteratorResult<ReactNode[], []>> {
    if (args[0] !== undefined) {
      this.#page = args[0];
    }
    console.log(`Request for page ${args[0]}`);
    return new Promise<IteratorResult<ReactNode[], []>>((res) => {
      res(
        this.#page < this.#maxPage
          ? {
              value: [...Array<ReactNode>(20)].map((_, j) => {
                return (
                  <div
                    data-testid={`card-${j + this.#page * 20}`}
                    className="p-4 rounded-lg m-2 bg-p-green-100"
                    key={`card-${j + this.#page * 20}`}
                  >{`card ${j + this.#page * 20}`}</div>
                );
              }),
              done: false,
            }
          : { value: [], done: false },
      );
    });
  }
  return(_: number): Promise<IteratorResult<ReactNode[], []>> {
    return new Promise<IteratorResult<ReactNode[], []>>((res) => {
      res({ value: [], done: true });
    });
  }
  throw(e: Error): Promise<IteratorResult<[], []>> {
    console.error(e);
    return new Promise((res) => {
      res({ value: [], done: false });
    });
  }
  [Symbol.asyncIterator](): AsyncGenerator<ReactNode, [], number> {
    return this[Symbol.asyncIterator]();
  }

  reset() {
    this.#page = 0;
  }
}

const generator = new MockPaginator(15);

const nextPage = jest.fn(async (p: number) => {
  const res = (await generator.next(p)).value;
  return res;
});

it("should render without crashing", () => {
  render(<CardList nextPage={nextPage} />);
});

it("should call the next page function", () => {
  render(<CardList nextPage={nextPage} />);
  expect(nextPage.mock.calls.length).toBeGreaterThan(0);
});
