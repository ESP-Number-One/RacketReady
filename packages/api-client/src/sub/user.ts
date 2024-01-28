import type { User, UserCreation } from "@esp-group-one/types";
import { SubAPIClient } from "./base.js";

export class UserAPIClient extends SubAPIClient<User, UserCreation> {}
