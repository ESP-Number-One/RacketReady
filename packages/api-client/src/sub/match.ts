import type { Match, MatchProposal } from "@esp-group-one/types";
import { SubAPIClient } from "./base.js";

export class MatchAPIClient extends SubAPIClient<Match, MatchProposal> {}
