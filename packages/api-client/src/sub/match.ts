import type {
  SortQuery,
  Match,
  MatchProposal,
  MatchQuery,
  ObjectId,
  PageOptions,
  Scores,
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

  public complete(id: ObjectId, scores: Scores): Promise<void> {
    return this.post(`${id.toString()}/complete`, scores);
  }

  public findProposed(
    opts: PageOptions<undefined, SortQuery<Match>>,
  ): Promise<Match[]> {
    return this.post("find/proposed", opts);
  }
}
