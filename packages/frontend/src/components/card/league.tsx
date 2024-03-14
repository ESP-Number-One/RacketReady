import { makeImgSrc, type CensoredLeague } from "@esp-group-one/types";
import { useContext, type JSX } from "react";
import moment from "moment";
import { API } from "../../state/auth";
import { ErrorHandler, useAsync } from "../../lib/async";
import { Tag } from "../tags";

function Loading() {
  return <>Loading.</>;
}

export function LeagueCard({
  data,
  badge = undefined,
}: {
  data: CensoredLeague;
  badge?: number;
}): JSX.Element {
  const api = useContext(API);
  const errorHandler = useContext(ErrorHandler);
  const { loading, error, ok } = useAsync(async () => ({
    firstMatch: await api.match().find({
      query: { league: data._id },
      // sort: { date: Sort.ASC },
      pageSize: 20,
    }),
  }))
    .loading(Loading)
    .catch(errorHandler)
    .await();

  if (!ok) return (loading ?? error) as JSX.Element;

  const date = ok.firstMatch[0]?.date ? (
    (() => {
      const firstMatchDate = moment(ok.firstMatch[0].date);
      return (
        <>
          <div className="day uppercase font-bold">
            {firstMatchDate.format("ddd")}
          </div>
          <div className="date font-bold text-5xl">
            {firstMatchDate.format("DD")}
          </div>
          <div className="month uppercase font-bold">
            {firstMatchDate.format("MMM")}
          </div>
        </>
      );
    })()
  ) : (
    <div className="font-bold text-5xl self-center">TBD</div>
  );
  return (
    <a
      className=" block w-full rounded-2xl overflow-clip text-white"
      href={`/league/${data._id.toString()}`}
    >
      <div className="grid columns-[min-content_min-content_1fr] grid-rows-2 gap-x-4 bg-p-grey-200 p-2">
        <div className="relative row-start-1 row-end-3 col-start-1 col-end-2 m-2 mr-0">
          <img
            src={makeImgSrc(data.picture)}
            alt={`${data.name} picture.`}
            className="h-full aspect-square rounded-2xl"
          />
          {badge ? (
            <div className="badge absolute flex justify-center font-title font-semibold text-xl w-3/5 left-[-10%] top-[-10%] rounded-full bg-p-red-200">
              {badge}
            </div>
          ) : null}
        </div>
        <div className="flex content-end flex-wrap col-start-2 col-end-3 row-start-1 row-end-2 font-title text-[1.6rem] font-bold align-bottom">
          {data.name}
        </div>
        <div className="col-start-2 col-end-3 row-start-2 row-end-3 font-title text-2xl align-top">
          <Tag sportName={data.sport} />
        </div>
        <div className="col-start-3 col-end-4 row-span-2 m-2">
          <div className="date flex flex-col justify-center items-center align-middle h-full">
            {date}
          </div>
        </div>
      </div>
    </a>
  );
}
