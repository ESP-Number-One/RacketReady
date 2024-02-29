import { cleanup, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { CardList } from "../src/components/card_list";

afterEach(cleanup);

const PageGenerator = async function* (maxPage: number) {
  let page = 0;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- necessary for generator
  while (true) {
    // eslint-disable-next-line no-await-in-loop -- This should be allowed
    await new Promise((res) => {
      setTimeout(res, 1000 * (0.5 + Math.random()));
    });
    // eslint-disable-next-line no-await-in-loop, @typescript-eslint/no-loop-func -- This should be allowed
    yield await new Promise<ReactNode[]>((res) => {
      console.log(`${page}/${maxPage}`);
      res(
        page < maxPage
          ? [...Array<ReactNode>(20)].map((_, j) => {
              return (
                <div
                  data-testid={`card-${j + page * 20}`}
                  className="p-4 rounded-lg m-2 bg-p-green-100"
                  key={`card-${j + page * 20}`}
                >{`card ${j + page * 20}`}</div>
              );
            })
          : [],
      );
    });
    page += 1;
  }
};

const generator = PageGenerator(15);

const nextPage = jest.fn(async (_: number) => {
  const res = (await generator.next()).value;
  return res;
});

it("should render without crashing", () => {
  render(<CardList nextPage={nextPage} />);
});

it("should call the next page function", () => {
  render(<CardList nextPage={nextPage} />);
  expect(nextPage.mock.calls.length).toBeGreaterThan(0);
});
