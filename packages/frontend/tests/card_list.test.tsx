import { cleanup, fireEvent, render } from "@testing-library/react";
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

let generator: MockPaginator;
let nextPage: jest.Mock<Promise<[] | ReactNode[]>>;

beforeEach(() => {
  generator = new MockPaginator(15);
  nextPage = jest.fn(async (p: number) => {
    await new Promise((res) => {
      setTimeout(res, (Math.random() + 0.5) * 1000);
      res(true);
    });
    const res = (await generator.next(p)).value;
    return res;
  });
});

it("should render without crashing", () => {
  render(<CardList nextPage={nextPage} />);
});

it("should call the next page function", () => {
  render(<CardList nextPage={nextPage} />);
  expect(nextPage).toHaveBeenCalledTimes(1);
  expect(nextPage.mock.calls).toStrictEqual([[0]]);
});

it("should call the next page once after scrolling to the bottom", async () => {
  const { container } = render(<CardList nextPage={nextPage} />);
  const divOrNull = container.getElementsByClassName("overflow-scroll").item(0);
  const cardList = divOrNull ? divOrNull : container;

  await new Promise((res) => {
    setTimeout(res, 2000);
  });

  // scroll the card list to the very bottom
  fireEvent.scroll(cardList, {
    top: cardList.scrollHeight - cardList.clientHeight,
  });

  await new Promise((res) => {
    setTimeout(res, 2000);
  });

  expect(
    container.getElementsByClassName("p-4 rounded-lg m-2 bg-p-green-100")
      .length,
  ).toBeGreaterThan(20);
  expect(nextPage).toHaveBeenCalledTimes(2);
  expect(nextPage.mock.calls).toStrictEqual([[0], [1]]);
});

it("should refresh the page when 'pulling down' the page from the top", () => {
  const { container } = render(<CardList nextPage={nextPage} />);
  const divOrNull = container
    .getElementsByClassName("grid-flow-row grid overflow-scroll max-h-screen")
    .item(0);

  const cardList = divOrNull ? divOrNull : container;

  // Simulate touching the screen at the very top,
  fireEvent.touchStart(cardList, { touches: [{ pageY: 10 }] });
  // then dragging the page down by 190 pixels, more than the threshold that should
  //  trigger a refresh,
  fireEvent.touchMove(cardList, { touches: [{ pageY: 200 }] });
  // and finally release the touch.
  fireEvent.touchEnd(cardList);

  // Expect the refresh icon to have the correct class name, i.e it should change style.
  expect(
    cardList.getElementsByClassName(
      "translate-y-24 duration-300 bg-white p-4 rounded-full self-center -rotate-180 shadow place-self-center",
    ).length,
  ).toBe(1);

  expect(
    cardList.getElementsByClassName(
      "translate-y-24 duration-300 bg-white p-4 rounded-full self-center -rotate-180 shadow place-self-center",
    )[0],
  ).toBeVisible();
});
