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
import { ControllerWrap } from "../controller.js";
import * as express from "express";
import { getUserId } from "../utils.js";

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

  @Get("me")
  public async getCurrentUser(
    @Request() req: express.Request,
  ): Promise<WithError<CensoredUser>> {
    return this.withUserId(req, async (userId) => {
      const res = await this.get(userId);
      if (res.success) return newAPISuccess(res.data);
      return res;
    });
  }

  @Get("{userId}")
  public async getUser(
    @Path() userId: ObjectId,
    @Request() req: express.Request,
  ): Promise<WithError<CensoredUser>> {
    return this.withUserId(req, async (currUser) => {
      const res = await this.get(userId);
      if (res.success)
        return newAPISuccess(
          userId === currUser ? res.data : censorUser(res.data),
        );
      return res;
    });
  }

  @Post("find")
  public async findUsers(
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

  @SuccessResponse("201", "Created")
  @Post("new")
  public async createUser(
    @Body() requestBody: UserCreation,
  ): Promise<WithError<CensoredUser>> {
    // TODO: Validate a user does not already exist with email
    return this.create(requestBody);
  }
}
