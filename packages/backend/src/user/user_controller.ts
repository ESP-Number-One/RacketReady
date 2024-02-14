import { DbClient } from "@esp-group-one/db-client";
import {
  newAPISuccess,
  type CensoredUser,
  type Error,
  type User,
  type UserCreation,
  type QueryOptions,
  type WithError,
  censorUser,
  newAPIError,
} from "@esp-group-one/types";
import type { OptionalId } from "mongodb";
import { ObjectId } from "mongodb";
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
import { getUserId, mapUser } from "../utils.js";

@Security("auth0")
@Route("user")
export class UsersController extends ControllerWrap<User, UserCreation> {
  creationToObj(creation: UserCreation): OptionalId<User> {
    return {
      sports: [],
      leagues: [],
      availability: [],
      ...creation,
    };
  }

  getCollection(): Promise<CollectionWrap<User>> {
    const client = new DbClient();
    return client.users();
  }

  /**
   * Returns all information about the currently logged in user.
   */
  @Response<Error>("500", "Internal Server Error")
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
   * Returns the user with the given ObjectId, however censors all users,
   * including the currently logged in one. User /me for all the users
   * information
   */
  @Response<Error>("500", "Internal Server Error")
  @Get("{userId}")
  public async getUser(
    @Path() userId: ObjectId,
  ): Promise<WithError<CensoredUser>> {
    const res = await this.get(userId);
    if (res.success) return newAPISuccess(censorUser(res.data));

    return res;
  }

  @Response<Error>("500", "Internal Server Error")
  @Get("{userId}/profile_picture")
  public async getProfilePicture(
    @Path() userId: ObjectId,
  ): Promise<WithError<string>> {
    const res = await this.get(userId);
    if (!res.success) return res;
    return newAPISuccess(`data:image/webp;base64,${res.data.profilePicture}`);
  }

  /**
   * This returns the users matching the given query, except the user currently
   * logged in.
   */
  @Response<Error>("500", "Internal Server Error")
  @Post("find")
  public async findUsers(
    // TODO: Move it to our own object which can be converted
    @Body() query: QueryOptions,
    @Request() req: express.Request,
  ): Promise<WithError<CensoredUser[]>> {
    return this.withUserId(req, async (currUser) => {
      const res = await this.find(query);
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
  @SuccessResponse("201", "Created")
  @Response<Error>("400", "Unknown image format")
  @Response<Error>("409", "User already exists")
  @Response<Error>("500", "Internal Server Error")
  @Post("new")
  public async createUser(
    @Body() requestBody: UserCreation,
    @Request() req: express.Request,
  ): Promise<WithError<CensoredUser>> {
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
      .then(async (currUser): Promise<WithError<CensoredUser>> => {
        const db = await this.getCollection();

        if (
          currUser ||
          (await db.exists({
            $or: [{ id: currUser }, { email: requestBody.email }],
          }))
        ) {
          this.setStatus(409);
          return newAPIError("User already exists");
        }

        return this.create(requestBody).then(async (user) => {
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
}
