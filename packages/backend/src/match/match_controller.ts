import type { FilterOptions } from "@esp-group-one/db-client";
import {
  MatchStatus,
  MatchProposal,
  ObjectId,
  PageOptions,
  newAPIError,
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
import { ID } from "../lib/types.js";

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
    @Path() matchId: ID,
    @Request() req: express.Request,
  ): Promise<WithError<Match>> {
    const id = new ObjectId(matchId);

    return this.withUserId(req, async (userId) => {
      const res = await this.get(id);
      if (res.success) {
        if (
          !res.data.players.map((p) => p.toString()).includes(userId.toString())
        ) {
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
    @Body() requestBody: PageOptions<MatchQuery>,
    @Request() req: express.Request,
  ): Promise<WithError<Match[]>> {
    return this.withVerifiedParam(requestBody, (opts) =>
      this.withUserId(req, async (currUser) => {
        const queries: Filter<Match>[] = [{ players: currUser }];
        if (opts.query) queries.push(opts.query);

        const newOpts: FilterOptions<Match> = {
          ...opts,
          // Note here we are not allowing the user to access all the matches
          // in a given league
          query: { $and: queries },
        };

        return this.find(newOpts);
      }),
    );
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
    return this.withVerifiedParam(requestBody, (proposal) => {
      const d = new Date(requestBody.date);
      if (d.toString() === "Invalid Date") {
        this.setStatus(400);
        return Promise.resolve(newAPIError("Invalid date"));
      }

      return this.withUserId(req, (userId) => {
        if (proposal.to.toString() === userId.toString()) {
          this.setStatus(400);
          return Promise.resolve(
            newAPIError("You cannot propose a match with yourself!"),
          );
        }

        let match: OptionalId<Match> = {
          status: MatchStatus.Request,
          messages: [],
          owner: userId,
          players: [userId, proposal.to],
          date: proposal.date,
          sport: proposal.sport,
        };

        if ("league" in proposal) {
          match = {
            ...match,
            league: proposal.league,
            round: proposal.round,
          };
        }

        return this.create(match);
      });
    });
  }
}
