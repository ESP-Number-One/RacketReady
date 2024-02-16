import type { FilterOptions } from "@esp-group-one/db-client";
import { DbClient } from "@esp-group-one/db-client";
import {
  censorLeague,
  newAPIError,
  newAPISuccess,
  ObjectId,
  LeagueCreation,
  QueryOptions,
  Sport,
} from "@esp-group-one/types";
import type {
  Error,
  LeagueQuery,
  CensoredLeague,
  League,
  WithError,
} from "@esp-group-one/types";
import type { Filter, OptionalId } from "mongodb";
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
import * as express from "express";
import { generateRandomString } from "ts-randomstring/lib";
import { ControllerWrap } from "../controller.js";

@Security("auth0")
@Route("league")
export class LeaguesController extends ControllerWrap<League> {
  getCollection(): Promise<CollectionWrap<League>> {
    const client = new DbClient();
    return client.leagues();
  }

  /**
   * Gets a given league checking if the user has access to it and censors it
   */
  @Response<Error>(404, "Failed to get obj")
  @Get("{leagueId}")
  public async getLeague(
    @Path() leagueId: string,
    @Request() req: express.Request,
  ): Promise<WithError<CensoredLeague>> {
    const id = new ObjectId(leagueId);
    return this.withUser(req, async (currUser) => {
      const res = await this.get(id);
      if (res.success) {
        if (res.data.private && !currUser.leagues.includes(id)) {
          // Don't want to give away the league exists if user does not have
          // access
          return this.notFound();
        }
        return newAPISuccess(censorLeague(res.data));
      }
      return res;
    });
  }

  /**
   * Gets the inviteCode for a given league.
   *
   * Only the owner of the league can access this endpoint
   */
  @Response<Error>("404", "Failed to get obj")
  @Get("{leagueId}/invite")
  public async getInviteCode(
    @Path() leagueId: string,
    @Request() req: express.Request,
  ): Promise<WithError<string>> {
    const id = new ObjectId(leagueId);
    return this.withUserId(req, async (userId) => {
      const res = await this.get(id);
      if (res.success) {
        if (res.data.private && res.data.ownerIds.includes(userId))
          return newAPISuccess(res.data.inviteCode);

        // Don't want to give away the league exists if user does not have
        // access
        return this.notFound();
      }
      return res;
    });
  }

  /**
   * Find leagues with the given query that the user has access to and censors
   * the leagues returned
   */
  @Response<Error>(500, "Internal Server Error")
  @Post("find")
  public async findLeagues(
    @Body() opts: QueryOptions<LeagueQuery>,
    @Request() req: express.Request,
  ): Promise<WithError<CensoredLeague[]>> {
    return this.withUser(req, async (currUser) => {
      let query: Filter<League> | undefined;
      if (opts.query) {
        const safeQuery = opts.query as Filter<LeagueQuery>;

        const newQuery: Filter<League> = {
          sport: safeQuery.sport as Filter<Document>,
          name: (typeof safeQuery.name === "string"
            ? new RegExp(safeQuery.name)
            : safeQuery.name) as Filter<Document>,
        };

        if (opts.query.amIn) {
          safeQuery.amIn = undefined;
          query = {
            $and: [newQuery, { _id: { $in: currUser.leagues } }],
          };
        } else {
          query = newQuery;
        }
      }

      const newOpts: FilterOptions<League> = {
        ...opts,
        query,
      };

      const res = await this.find(newOpts);
      if (res.success) return newAPISuccess(res.data.map(censorLeague));
      return res;
    });
  }

  /**
   * Allows the user to join a league. If the league is private, a inviteCode
   * must be provided in the body
   */
  @Response<Error>("404", "Failed to get obj")
  @Post("{leagueId}/join")
  public joinLeague(
    @Path() leagueId: string,
    @Body() body: { inviteCode?: string },
    @Request() req: express.Request,
  ): Promise<WithError<undefined>> {
    const id = new ObjectId(leagueId);
    return this.withUser(req, async (currUser) => {
      if (!currUser.leagues.includes(id)) {
        const league = await (await this.getCollection()).get(id);
        if (
          league &&
          // TODO: use safe equality check
          (!league.private || league.inviteCode === body.inviteCode)
        ) {
          // TODO: Update user
          return newAPISuccess(undefined);
        }
      }

      return this.notFound();
    });
  }

  /**
   * Creates a new league with the given information, setting the owner to the
   * current user
   */
  @SuccessResponse("201", "Created")
  @Post("new")
  public async createLeague(
    @Body() requestBody: LeagueCreation,
    @Request() req: express.Request,
  ): Promise<WithError<League>> {
    return this.withUserId(req, (currUser) => {
      let league: OptionalId<League>;
      if (requestBody.private) {
        league = {
          ...requestBody,
          private: true,
          ownerIds: [currUser],
          inviteCode: generateRandomString({ length: 32 }),
        };
      } else {
        league = {
          ...requestBody,
          private: false,
          ownerIds: [currUser],
        };
      }

      return this.create(league);
    });
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
