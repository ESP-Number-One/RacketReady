/* eslint-disable -- This is fine */

import { fakeLibrary } from "./__meta__";

// jest.mock("react-router-dom", () => {
//   const FAKES = [
//     "redirect",
//     "useParams",
//   ] as (keyof typeof import("react-router-dom"))[];
//   const og = jest.requireActual("react-router-dom");

//   const faked = Object.fromEntries(
//     FAKES.map((k) => [k, jest.fn().mockImplementation(og[k])]),
//   );

//   return {
//     ...og,
//     ...faked,
//   };
// });

fakeLibrary("react", {} as typeof import("react"), ["useRef", "useState"]);
fakeLibrary("react-router-dom", {} as typeof import("react-router-dom"), [
  "useParams",
  "useNavigate",
  "redirect",
]);
