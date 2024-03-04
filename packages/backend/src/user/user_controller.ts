import type { FilterOptions } from "@esp-group-one/db-client";
import {
  censorUser,
  newAPIError,
  newAPISuccess,
  ObjectId,
  UserCreation,
  PageOptions,
  ID,
} from "@esp-group-one/types";
import type {
  UserQuery,
  CensoredUser,
  Error,
  User,
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
import { getUserId, mapUser } from "../lib/utils.js";

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
   * @returns a string which can be put into an img element's src to display
   *   the image
   */
  @Response<Error>(500, "Internal Server Error")
  @Get("{userId}/profile_picture")
  public async getProfilePicture(
    @Path() userId: ID,
  ): Promise<WithError<string>> {
    const id = new ObjectId(userId);

    const res = await this.get(id);
    if (!res.success) return res;
    return newAPISuccess(`data:image/webp;base64,${res.data.profilePicture}`);
  }

  /**
   * This returns the users matching the given query, except the user currently
   * logged in.
   */
  @Response<Error>(500, "Internal Server Error")
  @Post("find")
  public async findUsers(
    @Body() requestBody: PageOptions<UserQuery>,
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

          if (text) {
            const textQuery: Filter<string> = {
              $regex: text,
              $options: "i",
            };
            query = {
              $or: [
                {
                  ...query,
                  name: textQuery,
                },
                {
                  ...query,
                  description: textQuery,
                },
              ],
            };
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
