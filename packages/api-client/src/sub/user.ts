import type {
  Availability,
  CensoredUser,
  DateTimeString,
  ObjectId,
  QueryOptions,
  SportInfo,
  User,
  UserCreation,
  UserMatchReturn,
  UserQuery,
} from "@esp-group-one/types";
import { SubAPIClient } from "./base.js";

export class UserAPIClient extends SubAPIClient<
  User,
  CensoredUser,
  UserCreation,
  UserQuery
> {
  /**
   * @param availability - The availability to set on your user
   */
  public addAvailability(availability: Availability): Promise<void> {
    return this.post("me/availability/add", availability);
  }

  /**
   * @param sports - sports to add/edit
   */
  public addSports(...sports: SportInfo[]): Promise<void> {
    return this.post("me/sports/add", { sports });
  }

  /**
   * @param details - An object containing the information you want to edit
   *   about the user
   * @returns void
   */
  public editMe(details: Partial<UserCreation>): Promise<void> {
    return this.post("me/edit", details);
  }

  /**
   * @param availability - The availability to set on your user
   * @param query - To control the paging
   * @returns The time strings where the current user and the given user are
   * both available
   */
  public findAvailabilityWith(
    id: ObjectId,
    query: QueryOptions<undefined>,
  ): Promise<DateTimeString[]> {
    return this.post(`${id.toString()}/availability`, query);
  }

  /**
   * @returns recommended users for the current user
   */
  public recommendations(): Promise<UserMatchReturn> {
    return this.post("recommendations", {});
  }

  /**
   * @returns currently logged in user
   */
  public me(): Promise<User> {
    return this.get("me", {});
  }
}
