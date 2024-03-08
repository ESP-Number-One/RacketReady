// TypeScript is weird and seems to believe the type is two different things
// depending on running build/test

import type { FetchMock } from "jest-fetch-mock";
import fetchMockImp from "jest-fetch-mock";

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- two typescript versions colliding
const fetchMock: FetchMock = (
  "default" in fetchMockImp ? fetchMockImp.default : fetchMockImp
) as FetchMock;

export { fetchMock, type FetchMock };
