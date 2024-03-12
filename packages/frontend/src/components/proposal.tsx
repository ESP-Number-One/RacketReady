import {
  makeImgSrc,
  type CensoredUser,
  type Match,
  type ObjectId,
} from "@esp-group-one/types";
import moment from "moment";
import { useContext, type JSX } from "react";
import { type APIClient } from "@esp-group-one/api-client";
import { API } from "../state/auth";
import { ErrorHandler, useAsync } from "../lib/async";
import { Tag } from "./tags";
import { Stars } from "./stars";
import { Button } from "./button";

function Loading() {
  return <>Loading.</>;
}

async function load(api: APIClient, data: Match) {
  const users = (await Promise.all(
    data.players.map((id) =>
      api
        .user()
        .getId(id)
        .then((user) => [id.toString(), user]),
    ),
  ).then(Object.fromEntries)) as Record<string, CensoredUser>;

  const profilePic = await api
    .user()
    .getId(data.owner)
    .then((u) => makeImgSrc(u.profilePicture));

  return { data, users, profilePic };
}

export function Proposal({
  onAccept = () => void 0,
  onDecline = () => void 0,
  ...props
}: {
  data: Match;
  onAccept?: (_: ObjectId) => void;
  onDecline?: (_: ObjectId) => void;
}) {
  const api = useContext(API);
  const errorHandler = useContext(ErrorHandler);

  const { ok, error, loading } = useAsync(() => load(api, props.data))
    .loading(Loading)
    .catch(errorHandler)
    .await();

  if (!ok) return (loading ?? error) as JSX.Element;

  const { data, users, profilePic } = ok;
  const date = moment(data.date);
  return (
    <div className="w-full rounded-2xl overflow-clip text-white">
      <div className="grid columns-[min-content_min-content_1fr] grid-rows-3 bg-p-grey-200 p-2">
        <div className="row-start-1 row-end-4 col-start-1 col-end-2 m-2">
          <img
            src={profilePic}
            alt={`${users[data.owner.toString()].name}'s Profile.`}
            className="h-full aspect-square rounded-2xl"
          />
        </div>
        <div className="col-start-2 col-end-3 row-start-1 row-end-2 font-title text-[1.6rem] font-bold">
          {users[data.owner.toString()].name}
        </div>
        <div className="col-start-2 col-end-3 row-start-2 row-end-3 font-title text-2xl">
          <Stars size="1x" rating={3} disabled />
        </div>
        <div className="col-start-2 col-end-3 row-start-3 row-end-4 font-title text-2xl">
          <Tag sportName={data.sport} />
        </div>
        <div className="col-start-3 col-end-4 row-span-2">
          <div className="date flex flex-col justify-center items-center align-middle">
            <div className="day uppercase">{date.format("dddd")}</div>
            <div className="date font-bold text-5xl">{date.format("DD")}</div>
            <div className="month uppercase">{date.format("MMM")}</div>
          </div>
        </div>
        <div className=" col-start-3 col-end-4 row-start-3 row-end-4 justify-self-center text-2xl font-bold">
          {date.format("HH:mm")}
        </div>
      </div>
      <div className="grid grid-cols-2 border-t-4 border-white">
        <Button
          backgroundColor="bg-p-red-100"
          roundedCorners={{
            bottomLeft: true,
            bottomRight: false,
            topLeft: false,
            topRight: false,
          }}
          onClick={() => {
            onDecline(data._id);
          }}
        >
          Decline
        </Button>
        <Button
          roundedCorners={{
            topLeft: false,
            bottomLeft: false,
            topRight: false,
            bottomRight: true,
          }}
          onClick={() => {
            onAccept(data._id);
          }}
        >
          Accept
        </Button>
      </div>
    </div>
  );
}
