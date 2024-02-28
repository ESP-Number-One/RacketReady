import type {
  Match,
  MatchProposal,
  MatchQuery,
  ObjectId,
  PageOptions,
} from "@esp-group-one/types";
import { SubAPIClient } from "./base.js";

export class MatchAPIClient extends SubAPIClient<
  Match,
  Match,
  MatchProposal,
  MatchQuery
> {
  public accept(id: ObjectId): Promise<void> {
    return this.post(`${id.toString()}/accept`, {});
  }

  public findProposed(opts: PageOptions<undefined>): Promise<Match[]> {
    return this.post("find/proposed", opts);
  }
}
