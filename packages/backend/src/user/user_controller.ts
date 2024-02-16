import type { FilterOptions } from "@esp-group-one/db-client";
import { DbClient } from "@esp-group-one/db-client";
import {
  censorUser,
  newAPIError,
  newAPISuccess,
  ObjectId,
  UserCreation,
  QueryOptions,
} from "@esp-group-one/types";
import type {
  UserQuery,
  CensoredUser,
  Error,
  User,
  WithError,
} from "@esp-group-one/types";
import type { Filter } from "mongodb";
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
    const client = new DbClient();
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
    return this.withUserId(req, async (userId) => {
      const res = await this.get(userId);
      return res;
    });
  }

  /**
   * @returns the user with the given ObjectId, however censors all users,
   *   including the currently logged in one. User /me for all the users
   *   information
   */
  @Response<Error>(500, "Internal Server Error")
  @Get("{userId}")
  public async getUser(
    @Path() userId: string,
  ): Promise<WithError<CensoredUser>> {
    const res = await this.get(new ObjectId(userId));
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
    @Path() userId: string,
  ): Promise<WithError<string>> {
    const res = await this.get(new ObjectId(userId));
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
    @Body() opts: QueryOptions<UserQuery>,
    @Request() req: express.Request,
  ): Promise<WithError<CensoredUser[]>> {
    return this.withUserId(req, async (currUser) => {
      const newOpts: FilterOptions<User> = {
        ...opts,
        query: opts.query as Filter<User> | undefined,
      };

      const res = await this.find(newOpts);
      if (res.success)
        return newAPISuccess(
          res.data.filter((user) => currUser !== user._id).map(censorUser),
        );
      return res;
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
    // TODO: Remove this check
    // Used for testing purposes
    if (requestBody.profilePicture !== "") {
      try {
        const imageBuffer = Buffer.from(requestBody.profilePicture, "base64");

        try {
          requestBody.profilePicture = (
            await sharp(imageBuffer)
              .resize(512, 512)
              .webp({ quality: 20 })
              .toBuffer()
          ).toString("base64");
        } catch (e) {
          this.setStatus(400);
          return newAPIError("Unknown image format");
        }
      } catch (e) {
        this.setStatus(400);
        return newAPIError("Could not pass base64");
      }
    }

    return getUserId(req)
      .then(async (currUser): Promise<WithError<User>> => {
        const db = await this.getCollection();

        if (currUser || (await db.exists({ email: requestBody.email }))) {
          this.setStatus(409);
          return newAPIError("User already exists");
        }

        return this.create({
          sports: [],
          leagues: [],
          availability: [],
          ...requestBody,
        }).then(async (user) => {
          // Error should be passed up to the next catch
          if (user.success) await mapUser(req, user.data._id);

          return user;
        });
      })
      .catch((e) => {
        this.setStatus(500);
        console.error(`Error when running with User: ${e}`);

        return newAPIError("User exists");
      });
  }

  /**
   * The edits the current user's information with the given info
   */
  @Response<Error>("500", "Internal Server Error")
  @Post("me/edit")
  public async editUsers(
    @Body() updateQuery: Partial<UserCreation>,
    @Request() req: express.Request,
  ): Promise<WithError<undefined>> {
    return this.withUserId(req, async (currUser) => {
      const setOp: Partial<UserCreation> = {};
      if (updateQuery.description) setOp.description = updateQuery.description;
      if (updateQuery.email) setOp.email = updateQuery.email;
      if (updateQuery.name) setOp.name = updateQuery.name;
      if (updateQuery.profilePicture)
        setOp.profilePicture = updateQuery.profilePicture;
      const coll = await this.getCollection();
      const res: Promise<WithError<undefined>> = coll
        .edit(currUser, setOp)
        .then(() => newAPISuccess(undefined))
        .catch((e) => {
          console.log(e);
          return newAPIError("Could not update user");
        });
      return res;
    });
  }
}
