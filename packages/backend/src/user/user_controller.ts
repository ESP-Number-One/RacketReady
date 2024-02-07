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
import { Body, Get, Path, Post, Route, Security, SuccessResponse } from "tsoa";
import type { CollectionWrap } from "@esp-group-one/db-client/build/src/collection.js";
import { ControllerWrap } from "../controller.js";

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

  @Get("{userId}")
  public async getUser(
    @Path() userId: ObjectId,
  ): Promise<WithError<CensoredUser>> {
    // TODO: Check if user has access to this information (if not censor it)
    const res = await this.get(userId);
    if (res.success) return newAPISuccess(censorUser(res.data));
    return res;
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
