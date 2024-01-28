import { DbClient } from "@esp-group-one/db-client";
import {
  type League,
  type LeagueCreation,
  type WithError,
  type QueryOptions,
} from "@esp-group-one/types";
import type { OptionalId } from "mongodb";
import { ObjectId } from "mongodb";
import { Body, Get, Path, Post, Route, SuccessResponse } from "tsoa";
import type { CollectionWrap } from "@esp-group-one/db-client/build/src/collection.js";
import { ControllerWrap } from "../controller.js";

@Route("league")
export class LeaguesController extends ControllerWrap<League, LeagueCreation> {
  creationToObj(proposal: LeagueCreation): OptionalId<League> {
    return proposal;
  }

  getCollection(): Promise<CollectionWrap<League>> {
    const client = new DbClient();
    return client.leagues();
  }

  @Get("{leagueId}")
  public async getLeague(
    @Path() leagueId: ObjectId,
  ): Promise<WithError<League>> {
    // TODO: Check if user has access to this information
    return this.get(leagueId);
  }

  @Post("find")
  public async findLeagues(
    @Body() query: QueryOptions,
  ): Promise<WithError<League[]>> {
    // TODO: Check if user has access to this information
    return this.find(query);
  }

  @Post("{leagueId}/join")
  public joinLeague(@Body() _: { inviteCode: string }): WithError<undefined> {
    // TODO: Implement
    return { success: true, data: undefined };
  }

  @SuccessResponse("201", "Created")
  @Post("new")
  public async createLeague(
    @Body() requestBody: LeagueCreation,
  ): Promise<WithError<League>> {
    // TODO: Validate the current user is in the owners
    return this.create(requestBody);
  }
}
