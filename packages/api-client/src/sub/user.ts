import type { User, UserCreation } from "@esp-group-one/types";
import { SubAPIClient } from "./base.js";

export class UserAPIClient extends SubAPIClient<User, UserCreation> {
  /**
   * @param id - ID of the user to get
   * @returns webp base64 encoded image with prefix `data:image/webp;base64,` so can be assigned to img.src
   */
  public getProfileSrc(id: string): Promise<string> {
    return this.get(`${id}/profile_picture`, {}) as Promise<string>;
  }
}
