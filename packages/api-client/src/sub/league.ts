import type {
  CensoredLeague,
  League,
  LeagueCreation,
  LeagueQuery,
  ObjectId,
} from "@esp-group-one/types";
import { SubAPIClient } from "./base.js";

export class LeagueAPIClient extends SubAPIClient<
  League,
  CensoredLeague,
  LeagueCreation,
  LeagueQuery
> {
  /**
   * @param id - The id of the league to edit
   * @param details - An object containing the information you want to edit
   *   about the user
   * @returns void
   */
  public edit(id: ObjectId, details: Partial<LeagueCreation>): Promise<void> {
    return this.post(`${id.toString()}/edit`, details);
  }

  /**
   * @param id - The id of the private league to get the invite code for
   * @returns the invite code if the current user is the owner
   */
  public getInviteCode(id: ObjectId): Promise<string> {
    return this.get(`${id.toString()}/invite`, {});
  }

  /**
   * @param id - The id of the league to join
   * @param inviteCode - If the league is private, an invite code is required
   * @returns void
   */
  public join(id: ObjectId, inviteCode?: string): Promise<void> {
    return this.post(`${id.toString()}/join`, { inviteCode });
  }
}
