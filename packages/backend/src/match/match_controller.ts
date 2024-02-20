import type { FilterOptions } from "@esp-group-one/db-client";
import {
  MatchStatus,
  ObjectId,
  MatchProposal,
  QueryOptions,
} from "@esp-group-one/types";
import type { Match, WithError, MatchQuery } from "@esp-group-one/types";
import {
  Body,
  Get,
  Path,
  Post,
  Request,
  Route,
  Security,
  SuccessResponse,
} from "tsoa";
import type { CollectionWrap } from "@esp-group-one/db-client/build/src/collection.js";
import type { Filter, OptionalId } from "mongodb";
import * as express from "express";
import { ControllerWrap } from "../controller.js";

@Security("auth0")
@Route("match")
export class MatchsController extends ControllerWrap<Match> {
  getCollection(): Promise<CollectionWrap<Match>> {
    const client = this.getDb();
    return client.matches();
  }

  /**
   * Gets a given match, validating the user is apart of the match, and returns
   * all its information
   */
  @Get("{matchId}")
  public async getMatch(
    @Path() matchId: string,
    @Request() req: express.Request,
  ): Promise<WithError<Match>> {
    return this.withUserId(req, async (userId) => {
      const res = await this.get(new ObjectId(matchId));
      if (res.success) {
        if (!res.data.players.includes(userId)) {
          return this.notFound();
        }
      }
      return res;
    });
  }

  /**
   * Finds given matches with the given query, validating the user is in those
   * matches
   */
  @Post("find")
  public async findMatchs(
    @Body() opts: QueryOptions<MatchQuery>,
    @Request() req: express.Request,
  ): Promise<WithError<Match[]>> {
    return this.withUserId(req, async (currUser) => {
      const newOpts: FilterOptions<Match> = {
        ...opts,
        query: opts.query as Filter<Match> | undefined,
      };

      if (newOpts.query) {
        // Note here we are not allowing the user to access all the matches
        // in a given league
        newOpts.query.players = currUser;
      }

      return this.find(newOpts);
    });
  }

  /**
   * Proposes a new match with the specified player, setting the user to the
   * owner and adding them to the match
   */
  @SuccessResponse("201", "Created")
  @Post("new")
  public async createMatch(
    @Body() requestBody: MatchProposal,
    @Request() req: express.Request,
  ): Promise<WithError<Match>> {
    return this.withUserId(req, (userId) => {
      let match: OptionalId<Match> = {
        status: MatchStatus.Request,
        messages: [],
        owner: userId,
        players: [userId, requestBody.to],
        date: requestBody.date,
        sport: requestBody.sport,
      };

      if ("league" in requestBody) {
        match = {
          ...match,
          league: requestBody.league,
          round: requestBody.round,
        };
      }

      return this.create(match);
    });
  }
}
