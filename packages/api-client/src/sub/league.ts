import type { League, LeagueCreation } from "@esp-group-one/types";
import { SubAPIClient } from "./base.js";

export class LeagueAPIClient extends SubAPIClient<League, LeagueCreation> {}
