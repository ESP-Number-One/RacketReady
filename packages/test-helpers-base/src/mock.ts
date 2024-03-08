import type { Moment } from "moment";
import moment from "moment";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- required by jest
type MockableFunction = (...args: any[]) => any;

export function asFuncMock<T extends MockableFunction>(
  mock: T,
): jest.MockedFunction<T> {
  return mock as unknown as jest.MockedFunction<T>;
}

export function stopTime() {
  const currentTime = moment().toISOString();
  jest.mock("moment", () => {
    return (param?: string) =>
      jest.requireActual<(inp: string) => Moment>("moment")(
        param ?? currentTime,
      );
  });
}
