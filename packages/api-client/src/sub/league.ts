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
   * @param id - ID of the user to get
   * @returns webp base64 encoded image with prefix `data:image/webp;base64,` so can be assigned to img.src
   */
  public getPictureSrc(id: ObjectId): Promise<string> {
    return this.get(`${id.toString()}/picture`, {});
  }
}
