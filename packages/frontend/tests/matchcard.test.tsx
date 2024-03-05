import { act, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  type CensoredUser,
  type Match,
  MatchStatus,
  type Message,
  ObjectId,
  Sport,
} from "@esp-group-one/types";
import { MatchCard } from "../src/components/matchcard";
import { MockAPI, MockErrorHandler } from "./helpers/utils";

describe("Tags", () => {
  const DUMMY_DATA = {
    _id: new ObjectId("65e5d03224bc2262ed90c038"),
    status: MatchStatus.Request,
    date: "2024-02-29T14:00:00Z",
    sport: Sport.Badminton,
    owner: new ObjectId("65e5d03224bc2262eb90c038"),
    players: [new ObjectId("65e5d03224bc2262eb90c038")],
    messages: [] as Message[],
  } as Match;

  const MockedAPI = MockAPI({
    user() {
      return {
        me: () =>
          Promise.resolve({
            _id: new ObjectId("65e5d03155bc2262eb90c038"),
            name: "Bot2",
            description: "Hello, world!",
            sports: [{ sport: Sport.Badminton, ability: "advanced" }],
            rating: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
          } as CensoredUser),
        getId: (_id: ObjectId) =>
          Promise.resolve({
            _id,
            name: "Bot1",
            description: "Hello, world!",
            sports: [{ sport: Sport.Badminton, ability: "beginner" }],
            rating: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
          } as CensoredUser),
        getProfileSrc: (_: string) =>
          Promise.resolve(
            "data:image/web,base64,UklGRq4EAABXRUJQVlA4IKIEAADwFACdASpQAFAAPo0+l0elI6IhK5jueKARiWwAxJnM/t3WjdS7d+Svs72vvHhOtunzvnoN3mT0AOmMrrDFMz5qgnIjg5X5NU8en1jv+/3J9kBUPMpda97E6afBMZKb2VT+qwcQx8Krz15p3EsgHLRti6oRVNTSF1InHGtuJRkp1YRwpk+44SVG6vs9Cx+FVOeqCWGGW/Us618Ii8vG64RefW22eOaIPjcX974jOP8wgAD+9oEXVAN8nHycfmdeB6pr8BBFeIxz7n7p6gdOJyHMvPLRjiuCBFhYVvi67EonqyeCnMxjLHhdZBZXU79Nw5Tx7NpeHJlbhKPQtV3Sinjvm4HU0Y6Ywsci4rW+j47pMuASolAUx2kuc1EhojTwNlVwWUnBkvyAOfKlei2+oQuDWSK+zxmK4VBpgJIbzSYGMbmXljmyA8pmIMGu7hdPsUEnZf8h638IgkFyJZ+qpIeAI0oBPbExIt9PgGsoMGqQ5XAcw441xcHxeYv4naK77l3KOsun2oG0XnFLB1x+/j/g3ziBpw/U+dEPGRhHN07XARVK+sRqFyncSbiIxQVzzkKwKW8Q7yq5HIhwhUqvIDS7ERiTxZFssSS15c5WYdg/EvFfZ/AyNyfiIRxGf2FTJUmYzLcZaZCphTDQAsofJS0stt9QPbWYRBTt7O9t6O9N+wUSmuIDGJeZ9NyvveMPTJL1ccn85Oyco1uxnayi4aJYyVG9yDrkUd+msRaXI8q/CuenJY5BTJAvpP+B5qqXMSv0ttWHFYP2Po3cLVkmMJ6PTSjVhRvYU2bKdT5nMT73tOfVwz2aqIPVfo3IeW6m2cya7bxdVVW1Y9D7tvDqru8WAwJjmrC4DpgTss2V3AeWbzTWm2mTbRPpHIAoNhLe7IXHlmcJHayXVTvffloAdfYQqjkm9SdpHgiqqfonO81r1IIqliBQls9JgpUA28juiX68SLIOLB+fQXUl9efkUdwbjVZ7Dd18LOH98pD/hKEUpKZi4EkqEumT62v3N2RZF5c59PPaiT9RWmXGYZXIigTqsMjV8nXdQSc8h8WxdU7dH1/4BtqPpiqUzoXYACFTK3xSlyZnPDeZHlykasVQaG/Fu+VH5uLGZfX/c17Ijaw4gm8zqShS1EQqXzeBtB/46bEA9YA7WfsFOB7n2MiBZuqhNzqcQV9nf5yN12K/SJb512v2/BnGQ02s1DBGfSjuuZMcPthIH+/6pXOkKUeUPIZgYWiAVng8tmaMlBl34ciOsALoJ7Kr5jOOdmJw8I8wuEKMx1vUWHWX9PGqVGiXwXO8KygYyVlyCuysp6IBjHlMXrMofyKbJbWvV1l83nKhPm+A0RwN76M97/OVXIyoWovqcY07GYwxnfbXbCF35ysajTGxtTSzViryP31PTfvLSDQT5yl+jtf5jQs8v8GzSZqyq8ArDgTElJRn5hXsD3zZPhWdhxeD2FvkC47Lt3WELRy+n71+Yf8mQ/FFtPt3UBl7vjLQ95Ja6p2eaHd8c99a3ox6d/PaGhgNIoJSYNARn+t15YAK5+hykqyRZf9qyTvXcht5n4ha7gvq7ed7SLuAAAAA",
          ),
      };
    },
  });
  test("Basics", async () => {
    const component = render(
      <MockedAPI>
        <MatchCard match={DUMMY_DATA} />
      </MockedAPI>,
    );

    // Loading state.
    expect(component.container).toHaveTextContent(/loading/i);

    // Fetch the stuff from the fake API.
    await act(() => Promise.resolve());

    expect(component.container).toHaveTextContent("Bot1"); // Contains name.
    expect(component.container).toHaveTextContent("Badminton"); // Contains sport.
    expect(component.container).toHaveTextContent(/feb/i); // Date
    expect(component.container).toHaveTextContent(/29/); // Date
    expect(component.container.querySelector("img")).toBeInTheDocument(); // Image exists.

    // TODO: Update this test whenever ratings actually become available.
  });

  test("Erroring", async () => {
    const FailingAPI = MockAPI({
      user() {
        return {
          getId: () => Promise.reject(new Error("Failed to get user")),
          getProfileSrc: () =>
            Promise.reject(new Error("Failed to get profile")),
        };
      },
    });

    const errorHandler = jest.fn();
    const ErrorHandling = MockErrorHandler(errorHandler);

    const proposal = render(
      <ErrorHandling>
        <FailingAPI>
          <MatchCard match={DUMMY_DATA} />
        </FailingAPI>
      </ErrorHandling>,
    );

    // Loading state.
    expect(proposal.container).toHaveTextContent(/loading/i);

    await act(() => Promise.resolve());

    expect(errorHandler).toHaveBeenCalled();
  });
});
