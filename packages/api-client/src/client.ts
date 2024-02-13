import { APIClientBase } from "./base.js";
import { LeagueAPIClient } from "./sub/league.js";
import { MatchAPIClient } from "./sub/match.js";
import { UserAPIClient } from "./sub/user.js";

export class APIClient extends APIClientBase {
  public league(): LeagueAPIClient {
    return new LeagueAPIClient(this.accessToken, `${this.url}/league`);
  }

  public match(): MatchAPIClient {
    return new MatchAPIClient(this.accessToken, `${this.url}/match`);
  }

  public user(): UserAPIClient {
    return new UserAPIClient(this.accessToken, `${this.url}/user`);
  }
}
