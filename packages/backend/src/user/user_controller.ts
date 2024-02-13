import { DbClient } from "@esp-group-one/db-client";
import {
  newAPISuccess,
  type CensoredUser,
  type User,
  type UserCreation,
  type QueryOptions,
  type WithError,
  censorUser,
} from "@esp-group-one/types";
import type { OptionalId } from "mongodb";
import { ObjectId } from "mongodb";
import sharp from "sharp";
import { Body, Get, Path, Post, Route, SuccessResponse } from "tsoa";
import type { CollectionWrap } from "@esp-group-one/db-client/build/src/collection.js";
import { ControllerWrap } from "../controller.js";

@Route("user")
export class UsersController extends ControllerWrap<User, UserCreation> {
  async creationToObj(creation: UserCreation): Promise<OptionalId<User>> {
    const imageBuffer = Buffer.from(creation.profilePicture, "base64");
    const profilePicture = await sharp(imageBuffer)
      .resize(512, 512)
      .webp({ quality: 20 })
      .toBuffer();

    return {
      sports: [],
      leagues: [],
      availability: [],
      ...creation,
      profilePicture: profilePicture.toString("base64"),
    };
  }

  getCollection(): Promise<CollectionWrap<User>> {
    const client = new DbClient();
    return client.users();
  }

  @Get("{userId}")
  public async getUser(
    @Path() userId: ObjectId,
  ): Promise<WithError<CensoredUser>> {
    // TODO: Check if user has access to this information (if not censor it)
    const res = await this.get(userId);
    if (res.success) return newAPISuccess(censorUser(res.data));
    return res;
  }

  @Get("{userId}/profilePicture")
  public async getProfilePicture(
    @Path() userId: ObjectId,
  ): Promise<WithError<string>> {
    const res = await this.get(userId);
    if (!res.success) return res;
    return newAPISuccess(`data:image/webp;base64,${res.data.profilePicture}`);
  }
  @Post("find")
  public async findUsers(
    @Body() query: QueryOptions,
  ): Promise<WithError<CensoredUser[]>> {
    // TODO: Check if user has access to this information (if not censor it)
    const res = await this.find(query);
    if (res.success) return newAPISuccess(res.data.map(censorUser));
    return res;
  }

  @SuccessResponse("201", "Created")
  @Post("new")
  public async createUser(
    @Body() requestBody: UserCreation,
  ): Promise<WithError<CensoredUser>> {
    // TODO: Validate a user does not already exist with email
    return this.create(requestBody);
  }
}
