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
  hasId,
  MatchPageOptions,
} from "@esp-group-one/types";
import type {
  Match,
  WithError,
  SortQuery,
  StarCount,
  Message,
} from "@esp-group-one/types";
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
import type { Filter, OptionalId, UpdateFilter } from "mongodb";
import * as express from "express";
import type { User } from "@esp-group-one/db-client/build/src/types.js";
import moment from "moment";
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
          !hasId(res.data.players, userId) ||
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
   * Cancels the given match if it hasn't happened yet
   */
  @Post("{matchId}/cancel")
  public cancelMatch(
    @Path() matchId: ID,
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

        if (res.data.status === MatchStatus.Complete) {
          this.setStatus(400);
          return newAPIError("The match is has completed");
        }

        const coll = await this.getCollection();
        await coll.delete(id);

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
        if (!hasId(res.data.players, userId)) {
          return this.notFound();
        }

        if (res.data.status !== MatchStatus.Accepted) {
          this.setStatus(400);
          return newAPIError("The match is not in accepted state");
        }

        if (moment().isBefore(res.data.date)) {
          this.setStatus(400);
          return newAPIError("The match has not started");
        }

        /* SCORES VALIDATION */
        const players = Object.keys(scores);

        // Get players which aren't in the match
        const difference = players.filter(
          (x) => !hasId(res.data.players, new ObjectId(x)),
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
            usersRated: [],
            score: scores,
          },
        });

        return newAPISuccess(undefined);
      }

      return res;
    });
  }

  /**
   * Sends a message on the given match.
   *
   * This can only be done when the message has been accepted but not completed
   */
  @Post("{matchId}/message")
  public message(
    @Path() matchId: ID,
    @Body() { message }: { message: string },
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
          return newAPIError("The match is not in an accepting state");
        }

        const fullMessage: Message = {
          sender: userId,
          text: message,
          date: moment().toISOString(),
        };

        const coll = await this.getCollection();
        await coll.edit(id, { $push: { messages: fullMessage } });

        return newAPISuccess(undefined);
      }

      return res;
    });
  }

  /**
   * Allows a single user to rate a given match, which will affect the ratings
   * of all other players in the match.
   *
   * They can only do this once
   */
  @Post("{matchId}/rate")
  public rateMatch(
    @Path() matchId: ID,
    @Body() rating: { stars: StarCount },
    @Request() req: express.Request,
  ): Promise<WithError<undefined>> {
    const id = new ObjectId(matchId);

    return this.withUserId(req, async (userId) => {
      const res = await this.get(id);
      if (res.success) {
        if (!hasId(res.data.players, userId)) {
          return this.notFound();
        }

        if (res.data.status !== MatchStatus.Complete) {
          this.setStatus(400);
          return newAPIError("The match has not completed");
        }

        console.log(JSON.stringify(res.data.usersRated));

        console.log(
          JSON.stringify(res.data.usersRated.map((p) => p.toString())),
        );
        if (hasId(res.data.usersRated, userId)) {
          this.setStatus(400);
          return newAPIError("You have already rated the match!");
        }

        const playersBeingRated = res.data.players.filter(
          (p) => !p.equals(userId),
        );

        const users = await this.getDb().users();
        const ratingQuery: UpdateFilter<User> = {};
        ratingQuery[`rating.${rating.stars}`] = 1;
        await users.editWithQuery(
          { _id: { $in: playersBeingRated } },
          { $inc: ratingQuery },
        );

        const coll = await this.getCollection();
        await coll.edit(id, { $push: { usersRated: userId } });
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
        if (!hasId(res.data.players, userId)) {
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
    @Body() requestBody: MatchPageOptions,
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
    @Body() requestBody: PageOptions<undefined, SortQuery<Match>>,
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
      const d = moment(requestBody.date);
      if (!d.isValid() || moment().isAfter(d)) {
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
          if (!hasId(user.leagues, proposal.league)) {
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
