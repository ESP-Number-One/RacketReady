import {
  makeImgSrc,
  type CensoredUser,
  type Match,
  type ObjectId,
  calculateAverageRating,
} from "@esp-group-one/types";
import type { Moment } from "moment";
import moment from "moment";
import { Tag } from "../tags";
import { Stars } from "../stars";
import { Button } from "../button";
import { Profile } from "../profile";

export function Proposal({
  onAccept = () => void 0,
  onDecline = () => void 0,
  data,
  opponent,
  className = "",
}: {
  className?: string;
  data: Match;
  opponent: CensoredUser;
  onAccept?: (_: ObjectId) => void;
  onDecline?: (_: ObjectId) => void;
}) {
  const startTime = moment(data.date);
  const info = formatDate(startTime);
  const endinfo = formatDate(startTime.clone().add(1, "hour"));
  return (
    <div className={`${className} rounded-lg w-full`}>
      <div className="flex p-2 relative border border-gray-300 bg-p-grey-200 rounded-t-lg">
        <div>
          <div className="image-container">
            <Profile imgSrc={makeImgSrc(opponent.profilePicture)} />
          </div>
        </div>
        <div className="ml-2 flex flex-col flex-1">
          <div className="leading-none font-title font-bold text-2xl text-white">
            {opponent.name}
          </div>
          <div className="font-body text-white text-xl">{`${info.time} - ${endinfo.time}`}</div>
          <div className="pt-2">
            <Tag sportName={data.sport} textSize="text-sm" />
          </div>
        </div>
        <div className="font-body font-bold text-base uppercase text-center pr-2 text-white pt-2">
          <div className="leading-none">{info.weekday}</div>
          <div className="text-3xl leading-none">{info.day}</div>
          <div className="leading-none">{info.month}</div>
        </div>
        <div className="absolute bottom-0 right-0 text-white pr-2 pb-1">
          <Stars
            padding="space-x-0"
            rating={calculateAverageRating(opponent.rating)}
            disabled
            size="1x"
          />
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

function formatDate(startTime: Moment) {
  const weekday = startTime.format("ddd");
  const day = startTime.format("D");
  const month = startTime.format("MMM");
  const time = startTime.format("HH:mm");
  return { weekday, day, month, time };
}
