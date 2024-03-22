import { APIClient } from "@esp-group-one/api-client";
import { MatchAPIClient } from "@esp-group-one/api-client/build/src/sub/match";
import { UserAPIClient } from "@esp-group-one/api-client/build/src/sub/user";
import type { UserMatchReturn } from "@esp-group-one/types";
import { Sport } from "@esp-group-one/types";
import {
  getLeague,
  getMatch,
  getUser,
} from "@esp-group-one/types/build/tests/helpers/utils";
import moment from "moment";
import { cleanup, render } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Cards } from "../../src/utils/types_to_cards";
import { mockRouting } from "../__meta__";

afterEach(cleanup);

describe("fromRecommendedUsers", () => {
  test("Normal", async () => {
    const Routing = await mockRouting();

    Routing.useLocation.mockReturnValue({
      state: 0,
      key: "0",
      pathname: "",
      search: "",
      hash: "",
    });

    Routing.useNavigate.mockImplementation(() => {
      return () => {
        void 0;
      };
    });

    const user = userEvent.setup();

    const firstDate = moment().add(1, "day");
    const sport = Sport.Squash;
    const users: UserMatchReturn = [
      { u: getUser({}), sport },
      { u: getUser({}), sport: Sport.Badminton },
    ];

    const client: APIClient = new APIClient("test_token");
    const findAvailabilityWith = jest
      .spyOn(UserAPIClient.prototype, "findAvailabilityWith")
      .mockImplementation(() =>
        Promise.resolve([
          firstDate.toISOString(),
          firstDate.clone().add(1, "day").toISOString(),
        ]),
      );

    const createMatch = jest
      .spyOn(MatchAPIClient.prototype, "create")
      .mockImplementation(() => {
        return Promise.resolve(getMatch({}));
      });

    const cards = await Cards.fromRecommendedUsers(users, client);
    const component = render(<div>{cards}</div>);

    expect(component.container).toBeInTheDocument();
    const htmlCards = component.container.children[0].children;

    expect(htmlCards.length).toBe(users.length);
    expect(findAvailabilityWith).toHaveBeenCalledTimes(2);
    expect(createMatch).toHaveBeenCalledTimes(0);

    const button = htmlCards[0].querySelector<HTMLButtonElement>(
      "button.bg-p-grey-900",
    );
    expect(button).not.toBeNull();
    if (button) await user.click(button);

    expect(createMatch).toHaveBeenCalledTimes(1);
    expect(createMatch).toHaveBeenCalledWith({
      date: firstDate.toISOString(),
      sport,
      to: users[0].u._id,
    });
  });
});

describe("fromLeagues", () => {
  test("Normal", () => {
    const leagues = [getLeague({}), getLeague({})];

    const cards = Cards.fromLeagues(leagues);
    const component = render(<div>{cards}</div>);

    expect(component.container).toBeInTheDocument();
    const htmlCards = component.container.children[0].children;
    expect(htmlCards.length).toBe(leagues.length);
  });
});
