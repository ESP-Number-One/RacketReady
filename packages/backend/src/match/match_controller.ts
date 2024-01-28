import { DbClient } from "@esp-group-one/db-client";
import {
  MatchStatus,
  type Match,
  type MatchProposal,
  type QueryOptions,
  type WithError,
} from "@esp-group-one/types";
import type { OptionalId } from "mongodb";
import { ObjectId } from "mongodb";
import { Body, Get, Path, Post, Route, SuccessResponse } from "tsoa";
import type { CollectionWrap } from "@esp-group-one/db-client/build/src/collection.js";
import { ControllerWrap } from "../controller.js";

@Route("match")
export class MatchsController extends ControllerWrap<Match, MatchProposal> {
  creationToObj(proposal: MatchProposal): OptionalId<Match> {
    return {
      status: MatchStatus.Request,
      messages: [],
      ...proposal,
    };
  }

  getCollection(): Promise<CollectionWrap<Match>> {
    const client = new DbClient();
    return client.matches();
  }

  @Get("{matchId}")
  public async getMatch(@Path() matchId: ObjectId): Promise<WithError<Match>> {
    // TODO: Check if user has access to this information
    return this.get(matchId);
  }

  @Post("find")
  public async findMatchs(
    @Body() query: QueryOptions,
  ): Promise<WithError<Match[]>> {
    // TODO: Check if user has access to this information
    return this.find(query);
  }

  @SuccessResponse("201", "Created")
  @Post("new")
  public async createMatch(
    @Body() requestBody: MatchProposal,
  ): Promise<WithError<Match>> {
    // TODO: Validate owner is set to themselves
    return this.create(requestBody);
  }
}
