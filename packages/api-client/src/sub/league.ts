import type {
  CensoredLeague,
  League,
  LeagueCreation,
  LeagueQuery,
} from "@esp-group-one/types";
import { SubAPIClient } from "./base.js";

export class LeagueAPIClient extends SubAPIClient<
  League,
  CensoredLeague,
  LeagueCreation,
  LeagueQuery
> {}
