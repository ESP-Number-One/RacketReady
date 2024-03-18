import type { FilterOptions } from "@esp-group-one/db-client";
import {
  censorUser,
  newAPIError,
  newAPISuccess,
  ObjectId,
  UserCreation,
  ID,
  Availability,
  QueryOptions,
  UserPageOptions,
} from "@esp-group-one/types";
import type {
  CensoredUser,
  DateTimeString,
  Error,
  SportInfo,
  User,
  UserMatchReturn,
  WithError,
} from "@esp-group-one/types";
import { type Filter } from "mongodb";
import sharp from "sharp";
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
import { ControllerWrap } from "../controller.js";
import { getUserId, mapUser, shuffle } from "../lib/utils.js";
import {
  getAvailabilityCache,
  setAvailabilityCache,
} from "../lib/availability_cache.js";

@Security("auth0")
@Route("user")
export class UsersController extends ControllerWrap<User> {
  getCollection(): Promise<CollectionWrap<User>> {
    const client = this.getDb();
    return client.users();
  }

  /**
   * Returns all information about the currently logged in user.
   */
  @Response<Error>(500, "Internal Server Error")
  @Get("me")
  public async getCurrentUser(
    @Request() req: express.Request,
  ): Promise<WithError<User>> {
    return this.withUser(req, (user) => {
      return Promise.resolve(newAPISuccess(user));
    });
  }

  /**
   * @returns the user with the given ObjectId, however censors all users,
   *   including the currently logged in one. User /me for all the users
   *   information
   */
  @Response<Error>(500, "Internal Server Error")
  @Get("{userId}")
  public async getUser(@Path() userId: ID): Promise<WithError<CensoredUser>> {
    const id = new ObjectId(userId);
    const res = await this.get(id);
    if (res.success) return newAPISuccess(censorUser(res.data));

    return res;
  }

  /**
   * @returns the time where the current user is available with another
   */
  @Response<Error>(500, "Internal Server Error")
  @Post("{userId}/availability")
  public async availabilityWith(
    @Path() userId: ID,
    @Body() query: QueryOptions<undefined>,
    @Request() req: express.Request,
  ): Promise<WithError<DateTimeString[]>> {
    const id = new ObjectId(userId);

    return this.withUserId(req, async (currUser) => {
      const caches = await this.getDb().availabilityCaches();
      const res = await caches.page({
        ...query,
        query: {
          $and: [{ availablePeople: id }, { availablePeople: currUser }],
        },
        sort: { start: 1 },
      });

      return newAPISuccess(res.map((cache) => cache.start));
    });
  }

  /**
   * This returns the users matching the given query, except the user currently
   * logged in.
   */
  @Response<Error>(500, "Internal Server Error")
  @Post("find")
  public async findUsers(
    @Body() requestBody: UserPageOptions,
    @Request() req: express.Request,
  ): Promise<WithError<CensoredUser[]>> {
    return this.withVerifiedParam(requestBody, (opts) =>
      this.withUserId(req, async (currUser) => {
        // We don't want to pass the current user back as a censored user
        const queries: Filter<User>[] = [{ _id: { $not: { $eq: currUser } } }];
        if (opts.query) {
          const text = opts.query.profileText;
          delete opts.query.profileText;
          let query = opts.query as Filter<User>;
          if (query.sports) {
            query["sports.sport"] = query.sports;
            delete query.sports;
          }

          if (text) {
            const regQuery: Filter<string> = {
              $regex: text,
              $options: "i",
            };

            const textQuery = {
              $or: [
                {
                  name: regQuery,
                },
                {
                  description: regQuery,
                },
              ],
            };

            query =
              Object.keys(query).length === 0
                ? textQuery
                : { $and: [textQuery, query] };
          }

          queries.push(query);
        }

        const newOpts: FilterOptions<User> = {
          ...opts,
          query: { $and: queries },
        };

        const res = await this.find(newOpts);
        if (res.success) {
          const censoredUsers = res.data.map(censorUser);
          return newAPISuccess(censoredUsers);
        }
        return res;
      }),
    );
  }

  /**
   * Returns a list of users which is thought to be a good match by
   * our super secret algorithm (unless there are no recommendations).
   *
   * Users may be repeated for different sports
   */
  @Post("recommendations")
  public async recommendations(
    @Request() req: express.Request,
  ): Promise<WithError<UserMatchReturn>> {
    return this.withUser(req, async (currUser) => {
      const db = this.getDb();
      const users = await this.getCollection();

      const ids = await getAvailabilityCache(db, currUser._id);
      const potentialUsers = await users.find({
        _id: { $in: ids },
        sports: { $in: currUser.sports },
      });

      const res: UserMatchReturn = potentialUsers.flatMap((u) => {
        const censored = censorUser(u);
        return u.sports
          .filter((s) =>
            currUser.sports.some(
              (o) => o.sport === s.sport && o.ability === s.ability,
            ),
          )
          .map((s) => {
            return { u: censored, sport: s.sport };
          });
      });

      // Randomise the order
      shuffle(res);

      return newAPISuccess(res);
    });
  }

  /**
   * Creates a new user and validates that their email and user id currently
   * are not in the database
   */
  @SuccessResponse(201, "Created")
  @Response<Error>(400, "Unknown image format")
  @Response<Error>(409, "User already exists")
  @Response<Error>(500, "Internal Server Error")
  @Post("new")
  public async createUser(
    @Body() requestBody: UserCreation,
    @Request() req: express.Request,
  ): Promise<WithError<User>> {
    return this.withVerifiedParam(requestBody, async (userCreation) => {
      // TODO: Remove this check
      // Used for testing purposes
      if (userCreation.profilePicture !== "") {
        const res = await this.checkAndCompressImage<User>(
          userCreation.profilePicture,
        );

        if (typeof res !== "string") return res;
        userCreation.profilePicture = res;
      }

      return getUserId(this.getDb(), req).then(
        async (currUser): Promise<WithError<User>> => {
          if (currUser || (await this.isUserUnique(userCreation.email))) {
            this.setStatus(409);
            return newAPIError("User already exists");
          }

          return this.create({
            sports: [],
            leagues: [],
            availability: [],
            rating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            ...userCreation,
          }).then(async (user) => {
            // Error should be passed up to the next catch
            if (user.success) await mapUser(this.getDb(), req, user.data._id);

            return user;
          });
        },
      );
    });
  }

  /**
   * Updates the users availability with the given information
   */
  @Response<Error>(500, "Internal Server Error")
  @Post("me/availability/add")
  public async addAvailability(
    @Body() availability: Availability,
    @Request() req: express.Request,
  ): Promise<WithError<undefined>> {
    return this.withUserId(req, async (userId) => {
      await setAvailabilityCache(this.getDb(), userId, availability);

      const coll = await this.getCollection();
      await coll.edit(userId, { $push: { availability } });

      return newAPISuccess(undefined);
    });
  }

  /**
   * The edits the current user's information with the given info
   */
  @Response<Error>(400, "Unknown image format")
  @Response<Error>(409, "User already exists")
  @Response<Error>("500", "Internal Server Error")
  @Post("me/edit")
  public async editUser(
    @Body() updateQuery: Partial<UserCreation>,
    @Request() req: express.Request,
  ): Promise<WithError<undefined>> {
    return this.withUserId(req, async (currUser) => {
      const setOp: Partial<UserCreation> = updateQuery;
      if (updateQuery.email) {
        if (await this.isUserUnique(updateQuery.email)) {
          this.setStatus(409);
          return newAPIError("User already exists");
        }
      }

      if (updateQuery.profilePicture) {
        const res = await this.checkAndCompressImage<undefined>(
          updateQuery.profilePicture,
        );

        if (typeof res !== "string") return res;
        setOp.profilePicture = res;
      }

      const coll = await this.getCollection();
      const res: Promise<WithError<undefined>> = coll
        .edit(currUser, { $set: setOp })
        .then(() => newAPISuccess(undefined));

      return res;
    });
  }

  @Post("me/sports/add")
  public async addSport(
    @Body() { sports }: { sports: SportInfo[] },
    @Request() req: express.Request,
  ): Promise<WithError<undefined>> {
    return this.withUser(req, async (currUser) => {
      const sportsAdded = sports.map((s) => s.sport);
      const unchangedSports = currUser.sports.filter(
        (s) => !sportsAdded.includes(s.sport),
      );
      const users = await this.getCollection();

      const infoToSet = [...unchangedSports, ...sports];

      await users.edit(currUser._id, { $set: { sports: infoToSet } });

      return newAPISuccess(undefined);
    });
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

  private async isUserUnique(email: string): Promise<boolean> {
    const db = await this.getCollection();

    return db.exists({ email });
  }
}
