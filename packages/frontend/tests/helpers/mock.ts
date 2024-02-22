// eslint-disable-next-line @typescript-eslint/no-explicit-any -- required by jest
type MockableFunction = (...args: any[]) => any;

export function asFuncMock<T extends MockableFunction>(
  mock: T,
): jest.MockedFunction<T> {
  return mock as unknown as jest.MockedFunction<T>;
}
