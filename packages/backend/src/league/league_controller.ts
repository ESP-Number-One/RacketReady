import type { FilterOptions } from "@esp-group-one/db-client";
import {
  censorLeague,
  newAPIError,
  newAPISuccess,
  LeagueCreation,
  ObjectId,
  PageOptions,
} from "@esp-group-one/types";
import type {
  Error,
  LeagueQuery,
  CensoredLeague,
  League,
  WithError,
} from "@esp-group-one/types";
import { type Filter, type OptionalId } from "mongodb";
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
import { generateRandomString } from "ts-randomstring/lib/index.js";
import { ControllerWrap } from "../controller.js";
import { ID } from "../lib/types.js";
import { safeEqual } from "../lib/utils.js";

@Security("auth0")
@Route("league")
export class LeaguesController extends ControllerWrap<League> {
  getCollection(): Promise<CollectionWrap<League>> {
    const client = this.getDb();
    return client.leagues();
  }

  /**
   * Gets a given league checking if the user has access to it and censors it
   */
  @Response<Error>(404, "Failed to get obj")
  @Get("{leagueId}")
  public async getLeague(
    @Path() leagueId: ID,
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
    @Path() leagueId: ID,
    @Request() req: express.Request,
  ): Promise<WithError<string>> {
    const id = new ObjectId(leagueId);

    return this.withUserId(req, async (userId) => {
      const res = await this.get(id);
      if (res.success) {
        if (
          res.data.private &&
          res.data.ownerIds.map((e) => e.toString()).includes(userId.toString())
        )
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
    @Body() requestBody: PageOptions<LeagueQuery>,
    @Request() req: express.Request,
  ): Promise<WithError<CensoredLeague[]>> {
    return this.withVerifiedParam(requestBody, (opts) =>
      this.withUser(req, async (currUser) => {
        const queries = [];
        if (opts.query && ("sport" in opts.query || "name" in opts.query)) {
          const safeQuery = opts.query as Filter<LeagueQuery>;

          const newQuery: Filter<League> = {
            sport: safeQuery.sport as Filter<Document>,
            name: (typeof safeQuery.name === "string"
              ? { $regex: safeQuery.name, $options: "i" }
              : safeQuery.name) as Filter<Document>,
          };

          queries.push(newQuery);
        }

        const orQueries: Filter<League>[] = [];

        if (!opts.query?.amIn) orQueries.push({ private: false });

        // If the request has specifically stated they don't want queries
        // with them in, just ignore
        if (opts.query && "amIn" in opts.query && !opts.query.amIn) {
          queries.push({ _id: { $not: { $in: currUser.leagues } } });
        } else {
          orQueries.push({ _id: { $in: currUser.leagues } });
        }

        if (orQueries.length > 0) {
          queries.push(
            orQueries.length === 1
              ? orQueries[0]
              : {
                  $or: orQueries,
                },
          );
        }

        let query = {};
        if (queries.length > 0) {
          query = queries.length === 1 ? queries[0] : { $and: queries };
        }

        const newOpts: FilterOptions<League> = {
          ...opts,
          query,
        };

        const res = await this.find(newOpts);
        if (res.success) return newAPISuccess(res.data.map(censorLeague));
        return res;
      }),
    );
  }

  /**
   * Allows the user to join a league. If the league is private, a inviteCode
   * must be provided in the body
   */
  @Response<Error>("404", "Failed to get obj")
  @Post("{leagueId}/join")
  public joinLeague(
    @Path() leagueId: ID,
    @Request() req: express.Request,
    @Body() body?: { inviteCode?: string },
  ): Promise<WithError<undefined>> {
    const id = new ObjectId(leagueId);
    return this.withUser(req, async (currUser) => {
      if (!currUser.leagues.map((e) => e.toString()).includes(id.toString())) {
        const league = await (await this.getCollection()).get(id);
        if (
          league &&
          (!league.private ||
            (body?.inviteCode && safeEqual(league.inviteCode, body.inviteCode)))
        ) {
          await (
            await this.getDb().users()
          ).edit(currUser._id, {
            $push: { leagues: league._id },
          });

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
  @Response<Error>("409", "League already exists")
  @Post("new")
  public async createLeague(
    @Body() requestBody: LeagueCreation,
    @Request() req: express.Request,
  ): Promise<WithError<League>> {
    return this.withVerifiedParam(requestBody, (creation) =>
      this.withUserId(req, async (currUser) => {
        const coll = await this.getCollection();
        if (await coll.exists({ name: creation.name })) {
          this.setStatus(409);
          return newAPIError("League already exists");
        }

        let league: OptionalId<League>;
        if (creation.private) {
          league = {
            ...creation,
            private: true,
            ownerIds: [currUser],
            inviteCode: generateRandomString({ length: 32 }),
          };
        } else {
          league = {
            ...creation,
            private: false,
            ownerIds: [currUser],
          };
        }

        return this.create(league);
      }),
    );
  }

  /**
   * The edits the current leagues's information with the given info
   */
  @Response<Error>("500", "Internal Server Error")
  @Post("{leagueId}/edit")
  public async editLeagues(
    @Path() leagueId: ID,
    @Body() requestBody: Partial<LeagueCreation>,
    @Request() req: express.Request,
  ): Promise<WithError<undefined>> {
    const id = new ObjectId(leagueId);
    return this.withVerifiedParam(requestBody, (updateQuery) =>
      this.withUserId(req, async (currUser) => {
        const getRes = await this.get(id);
        if (!getRes.success) return getRes;

        const league = getRes.data;
        if (
          !league.ownerIds
            .map((e) => e.toString())
            .includes(currUser.toString())
        )
          return this.notFound();

        const coll = await this.getCollection();
        const res: Promise<WithError<undefined>> = coll
          .edit(id, { $set: updateQuery })
          .then(() => newAPISuccess(undefined))
          .catch((e) => {
            console.log(e);
            return newAPIError("Could not update league");
          });

        return res;
      }),
    );
  }
}
