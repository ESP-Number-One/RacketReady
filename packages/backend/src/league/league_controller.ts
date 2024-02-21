import { DbClient } from "@esp-group-one/db-client";
import {
  newAPISuccess,
  type Error,
  type League,
  type LeagueCreation,
  type WithError,
  type QueryOptions,
  newAPIError,
} from "@esp-group-one/types";
import type { OptionalId } from "mongodb";
import { ObjectId } from "mongodb";
import {
  Body,
  Get,
  Path,
  Post,
  Request,
  Response,
  Route,
  Security,
  SuccessResponse,
} from "tsoa";
import type { CollectionWrap } from "@esp-group-one/db-client/build/src/collection.js";
import { Sport } from "@esp-group-one/types/src/utils.js";
import * as express from "express";
import { ControllerWrap } from "../controller.js";

@Security("auth0")
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

  /**
   * The edits the current leagues's information with the given info
   */
  @Response<Error>("500", "Internal Server Error")
  @Post("league/edit")
  public async editLeagues(
    @Body() updateQuery: Partial<LeagueCreation>,
    @Request() req: express.Request,
  ): Promise<WithError<undefined>> {
    return this.withUserId(req, async (currLeague) => {
      const setOp: Partial<LeagueCreation> = {};
      if (updateQuery.name) setOp.name = updateQuery.name;
      if (updateQuery.sport && Object.values(Sport).includes(updateQuery.sport))
        setOp.sport = updateQuery.sport;
      if (updateQuery.private) setOp.private = updateQuery.private;
      const coll = await this.getCollection();
      const res: Promise<WithError<undefined>> = coll
        .edit(currLeague, setOp)
        .then(() => newAPISuccess(undefined))
        .catch((e) => {
          console.log(e);
          return newAPIError("Could not update league");
        });
      return res;
    });
  }
}
