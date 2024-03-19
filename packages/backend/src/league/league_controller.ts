import { randomInt } from "node:crypto";
import type { FilterOptions } from "@esp-group-one/db-client";
import {
  censorLeague,
  newAPIError,
  newAPISuccess,
  LeagueCreation,
  ObjectId,
  ID,
  hasId,
  LeaguePageOptions,
  MatchStatus,
  AbilityLevel,
  Sport,
} from "@esp-group-one/types";
import type {
  Error,
  LeagueQuery,
  CensoredLeague,
  League,
  WithError,
  Match,
  Scores,
} from "@esp-group-one/types";
import { type Filter, type OptionalId, ObjectId as MongoId } from "mongodb";
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
import type { Moment } from "moment";
import moment from "moment";
import sharp from "sharp";
import { ControllerWrap } from "../controller.js";
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
   * * Finds all of the rounds in a league.
   */
  @Response<Error>(404, "Failed to get obj")
  @Get("{leagueId}/rounds")
  public async getLeagueRounds(
    @Path() leagueId: ID,
    @Request() req: express.Request,
  ): Promise<WithError<{ rounds: string[] }>> {
    const id = new ObjectId(leagueId);

    return this.withUser(req, async (currUser) => {
      const res = await this.get(id);
      if (res.success) {
        if (res.data.private && !currUser.leagues.includes(id)) {
          // Don't want to give away the league exists if user does not have
          // access
          return this.notFound();
        }
        const matches = (await this.getDb().matches()).raw();
        const rounds = (await matches.distinct("round", {
          league: new MongoId(id.mongoDbId),
        })) as string[];
        return newAPISuccess({ rounds });
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
        if (res.data.private && hasId(res.data.ownerIds, userId))
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
    @Body()
    requestBody: LeaguePageOptions,
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
      if (!hasId(currUser.leagues, id)) {
        const league = await (await this.getCollection()).get(id);
        if (
          league &&
          league.round === 0 &&
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
  @Response<Error>("400", "Unknown image format")
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

        if (creation.picture) {
          const res = await this.checkAndCompressImage<League>(
            creation.picture,
          );

          if (typeof res !== "string") return res;
          creation.picture = res;
        }

        let league: OptionalId<League>;
        if (creation.private) {
          league = {
            ...creation,
            private: true,
            ownerIds: [currUser],
            round: 0,
            inviteCode: generateRandomString({ length: 32 }),
          };
        } else {
          league = {
            ...creation,
            private: false,
            ownerIds: [currUser],
            round: 0,
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
  @Response<Error>("400", "Unknown image format")
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
        if (!hasId(league.ownerIds, currUser)) return this.notFound();

        if (updateQuery.picture) {
          const res = await this.checkAndCompressImage<undefined>(
            updateQuery.picture,
          );

          if (typeof res !== "string") return res;
          updateQuery.picture = res;
        }

        const coll = await this.getCollection();
        const res: Promise<WithError<undefined>> = coll
          .edit(id, { $set: updateQuery })
          .then(() => newAPISuccess(undefined))
          .catch((e: Error) => {
            console.log(`Could not update league: ${e.toString()}`);
            this.setStatus(500);
            return newAPIError("Could not update league");
          });

        return res;
      }),
    );
  }

  /**
   * Generates match proposal
   */
  @Response<Error>(
    409,
    "Force needs to be present if starting round before previous finished",
  )
  @Post("{leagueId}/round/next")
  public async generateMatchProposals(
    @Path() leagueId: ID,
    @Body() params: { force: boolean },
    @Request() req: express.Request,
  ): Promise<WithError<undefined>> {
    const id = new ObjectId(leagueId);

    return this.withUser(req, async (currUser) => {
      const res = await this.get(id);
      if (!res.success) {
        return res;
      }

      const league = res.data;
      if (!hasId(league.ownerIds, currUser._id)) {
        return this.notFound();
      }

      // Fetch users associated with the league from the database
      // On the first round, assign everyone, otherwise don't
      let users;
      const usersColl = await this.getDb().users();
      if (league.round === 0) {
        users = await usersColl.find({ leagues: league._id });
      } else {
        const matchesColl = await this.getDb().matches();
        const matches = await matchesColl.find({ league: league._id });
        if (
          !params.force &&
          matches.some((m) => m.status !== MatchStatus.Complete)
        ) {
          this.setStatus(409);
          return newAPIError(
            "All matches must be complete to go to the next round",
          );
        }

        const winners = matches.flatMap((m) => {
          if (m.status === MatchStatus.Complete) {
            // Gets ID with the maximum score
            return [
              new ObjectId(
                Object.entries(m.score).reduce((a, b) =>
                  a[1] > b[1] ? a : b,
                )[0],
              ),
            ];
          }
          return [];
        });

        users = await usersColl.find({ _id: { $in: winners } });
      }

      if (users.length <= 1) {
        this.setStatus(409);
        return newAPIError(
          "Not enough users are able to play in the next round",
        );
      }

      // Increments the round of the league
      const coll = await this.getCollection();
      await coll.edit(id, { $inc: { round: 1 } });
      league.round += 1;

      // Group users by sport and ability level
      const peopleBySportAndAbilityLevel = Object.fromEntries(
        Object.values(Sport).map((sport) => [
          sport,
          Object.fromEntries(
            Object.values(AbilityLevel).map((ability) => [
              ability,
              [] as ObjectId[],
            ]),
          ),
        ]),
      ) as Record<Sport, Record<AbilityLevel, ObjectId[]>>;

      for (const user of users) {
        for (const sportInfo of user.sports) {
          peopleBySportAndAbilityLevel[sportInfo.sport][sportInfo.ability].push(
            user._id,
          );
        }
      }

      // Generate match proposals for each sport and ability level
      const matchProposals: Promise<OptionalId<Match>[]>[] = [];
      for (const sport of [league.sport]) {
        const excess: ObjectId[] = [];

        for (const abilityLevel of Object.values(AbilityLevel)) {
          const people =
            peopleBySportAndAbilityLevel[sport as Sport][
              abilityLevel as AbilityLevel
            ];

          matchProposals.push(this.createMatchesFor(league, sport, people));
          // Catch anyone who hasn't been assigned
          if (people.length % 2 !== 0) {
            excess.push(people[people.length - 1]);
          }
        }

        if (excess.length > 0) {
          matchProposals.push(this.createMatchesFor(league, sport, excess));
          if (excess.length % 2 !== 0) {
            // Special case when there are an odd number of players
            const person = excess[excess.length - 1];
            const score: Scores = {};
            score[person.toString()] = 1;
            matchProposals.push(
              Promise.resolve([
                {
                  sport,
                  date: moment().toISOString(),
                  messages: [],
                  owner: league._id,
                  players: [person],
                  status: MatchStatus.Complete,
                  score,
                  league: league._id,
                  round: league.round,
                  usersRated: [person],
                } as OptionalId<Match>,
              ]),
            );
          }
        }
      }

      const proposals = await Promise.all(matchProposals);
      await (await this.getDb().matches()).insert(...proposals.flat());

      return newAPISuccess(undefined);
    });
  }

  private async createMatchesFor(
    league: League,
    sport: Sport,
    people: ObjectId[],
  ): Promise<OptionalId<Match>[]> {
    const availColl = await this.getDb().availabilityCaches();
    const matchProposals: Promise<OptionalId<Match>>[] = [];

    for (let i = 0; i + 1 < people.length; i += 2) {
      const proposal: Promise<OptionalId<Match>> = availColl
        .page({
          query: {
            $and: [
              {
                start: { $gt: moment().add(1, "day").toISOString() },
              },
              {
                availablePeople: people[i],
              },
              {
                availablePeople: people[i + 1],
              },
            ],
          },
          pageSize: 1,
          pageStart: 1,
        })
        .then((availability) => {
          let date: Moment;
          if (availability.length > 0) {
            date = moment(availability[0].start);
          } else {
            // Generate a random time in the working hours
            // if there are no available times
            date = moment().startOf("day").set("hour", 9);
            date = date.add(randomInt(7) + 1, "day");
            date = date.add(randomInt(8), "hour");
          }

          return {
            sport,
            date: date.toISOString(),
            messages: [],
            owner: league._id,
            players: [people[i], people[i + 1]],
            status: MatchStatus.Request,
            league: league._id,
            round: league.round,
          };
        });

      matchProposals.push(proposal);
    }

    return Promise.all(matchProposals);
  }

  private async checkAndCompressImage<T>(
    image: string,
  ): Promise<string | WithError<T>> {
    // This doesn't seem to crash
    const imageBuffer = Buffer.from(image, "base64");

    try {
      return (
        await sharp(imageBuffer)
          .resize(512, 512)
          .webp({ quality: 20 })
          .toBuffer()
      ).toString("base64");
    } catch (e) {
      this.setStatus(400);
      return newAPIError("Unknown image format");
    }
  }
}
