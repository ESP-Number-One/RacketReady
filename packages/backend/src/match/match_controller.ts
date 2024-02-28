import type { FilterOptions } from "@esp-group-one/db-client";
import {
  MatchStatus,
  MatchProposal,
  ObjectId,
  PageOptions,
  newAPIError,
  newAPISuccess,
  Scores,
  ID,
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
   * Accepts the given match
   */
  @Post("{matchId}/accept")
  public acceptMatch(
    @Path() matchId: ID,
    @Request() req: express.Request,
  ): Promise<WithError<undefined>> {
    const id = new ObjectId(matchId);

    return this.withUserId(req, async (userId) => {
      const res = await this.get(id);
      if (res.success) {
        if (
          !res.data.players
            .map((p) => p.toString())
            .includes(userId.toString()) ||
          res.data.owner.toString() === userId.toString()
        ) {
          return this.notFound();
        }

        if (res.data.status !== MatchStatus.Request) {
          this.setStatus(400);
          return newAPIError("The match is already accepted");
        }

        const coll = await this.getCollection();
        await coll.edit(id, { $set: { status: MatchStatus.Accepted } });
        return newAPISuccess(undefined);
      }

      return res;
    });
  }

  /**
   * Accepts the given match
   */
  @Post("{matchId}/complete")
  public completeMatch(
    @Path() matchId: ID,
    @Body() scores: Scores,
    @Request() req: express.Request,
  ): Promise<WithError<undefined>> {
    const id = new ObjectId(matchId);

    return this.withUserId(req, async (userId) => {
      const res = await this.get(id);
      if (res.success) {
        if (
          !res.data.players.map((p) => p.toString()).includes(userId.toString())
        ) {
          return this.notFound();
        }

        if (res.data.status !== MatchStatus.Accepted) {
          this.setStatus(400);
          return newAPIError("The match is not in accepted state");
        }

        if (new Date() <= new Date(res.data.date)) {
          this.setStatus(400);
          return newAPIError("The match has not started");
        }

        /* SCORES VALIDATION */
        const players = Object.keys(scores);
        const matchPlayers = res.data.players.map((p) => p.toString());

        // Get players which aren't in the match
        const difference = players.filter(
          (x) => !matchPlayers.includes(x.toString()),
        );

        if (
          res.data.players.length !== Object.keys(scores).length ||
          difference.length > 0
        ) {
          this.setStatus(400);
          return newAPIError("The number of scores + players does not match");
        }

        const coll = await this.getCollection();
        await coll.edit(id, {
          $set: {
            status: MatchStatus.Complete,
            score: scores,
          },
        });

        return newAPISuccess(undefined);
      }

      return res;
    });
  }

  /**
   * Gets a given match, validating the user is apart of the match, and returns
   * all its information
   */
  @Get("{matchId}")
  public getMatch(
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
   * Finds given matches with the given query, validating the user is in those
   * matches
   */
  @Post("find/proposed")
  public async findProposedMatchs(
    @Body() requestBody: PageOptions<undefined>,
    @Request() req: express.Request,
  ): Promise<WithError<Match[]>> {
    return this.withVerifiedParam(requestBody, (opts) =>
      this.withUserId(req, async (userId) => {
        return this.find({
          ...opts,
          query: {
            $and: [{ owner: { $not: { $eq: userId } } }, { players: userId }],
          },
        });
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

      return this.withUser(req, async (user) => {
        const db = this.getDb();
        const users = await db.users();

        if (proposal.to.toString() === user._id.toString()) {
          this.setStatus(400);
          return Promise.resolve(
            newAPIError("You cannot propose a match with yourself!"),
          );
        } else if (!(await users.exists({ _id: proposal.to }))) {
          this.setStatus(400);
          return Promise.resolve(
            newAPIError("You cannot propose a match with a non-existent user!"),
          );
        }

        let match: OptionalId<Match> = {
          status: MatchStatus.Request,
          messages: [],
          owner: user._id,
          players: [user._id, proposal.to],
          date: proposal.date,
          sport: proposal.sport,
        };

        // TODO: Consider removing when we replace with the auto league assignment
        if ("league" in proposal) {
          if (
            !user.leagues
              .map((l) => l.toString())
              .includes(proposal.league.toString())
          ) {
            this.setStatus(400);
            return newAPIError("You must be in the league to create a match");
          }

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
