import type {
  Match,
  MatchProposal,
  MatchQuery,
  PageOptions,
} from "@esp-group-one/types";
import { SubAPIClient } from "./base.js";

export class MatchAPIClient extends SubAPIClient<
  Match,
  Match,
  MatchProposal,
  MatchQuery
> {
  public findProposed(opts: PageOptions<undefined>): Promise<Match[]> {
    return this.post("find/proposed", opts);
  }
}
