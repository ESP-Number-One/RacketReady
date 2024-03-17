import { makeImgSrc, type CensoredLeague } from "@esp-group-one/types";
import { useContext, type JSX } from "react";
import moment from "moment";
import { twMerge } from "tailwind-merge";
import { API } from "../../state/auth";
import { ErrorHandler, useAsync } from "../../lib/async";
import { Tag } from "../tags";
import { Profile } from "../profile";
import { Link } from "../link";

function Loading() {
  return <>Loading.</>;
}

export function LeagueCard({
  className = "",
  data,
}: {
  className?: string;
  data: CensoredLeague;
}): JSX.Element {
  const api = useContext(API);
  const errorHandler = useContext(ErrorHandler);

  const { ok } = useAsync(async () => ({
    firstMatch: await api.match().find({
      query: { league: data._id },
      // sort: { date: Sort.ASC },
      pageSize: 20,
    }),
  }))
    .loading(Loading)
    .catch(errorHandler)
    .await();

  const date = ok?.firstMatch[0]?.date ? (
    (() => {
      const firstMatchDate = moment(ok.firstMatch[0].date);
      return (
        <div className="date font-body font-bold text-base uppercase text-center pr-2 text-white pt-2">
          <div className="leading-none">{firstMatchDate.format("ddd")}</div>
          <div className="text-3xl leading-none">
            {firstMatchDate.format("DD")}
          </div>
          <div className="leading-none">{firstMatchDate.format("MMM")}</div>
        </div>
      );
    })()
  ) : (
    <></>
  );

  return (
    <Link
      href={`/league/${data._id.toString()}`}
      className={twMerge(
        "rounded-lg border w-full border-gray-300 p-2 flex items-center bg-p-grey-200",
        className,
      )}
    >
      <div className="mr-4">
        <div className="image-container">
          <Profile imgSrc={makeImgSrc(data.picture)} />
        </div>
      </div>
      <div className="flex flex-col flex-1">
        <div className="font-title font-bold text-xl text-white">
          {data.name}
        </div>
        <div className="pb-1">
          <Tag sportName={data.sport} />
        </div>
      </div>
      {date}
    </Link>
  );
}
