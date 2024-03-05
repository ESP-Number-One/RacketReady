import type {
  CensoredUser,
  ObjectId,
  User,
  UserCreation,
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
   * @param id - ID of the user to get
   * @returns webp base64 encoded image with prefix `data:image/webp;base64,` so can be assigned to img.src
   */
  public getProfileSrc(id: ObjectId): Promise<string> {
    return this.get(`${id.toString()}/profile_picture`, {});
  }

  /**
   * @returns currently logged in user
   */
  public me(): Promise<User> {
    return this.get("me", {});
  }
}
