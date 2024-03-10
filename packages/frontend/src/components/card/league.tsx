import { type League } from "@esp-group-one/types";
import { useContext, type JSX } from "react";
import moment from "moment";
import { API } from "../../state/auth";
import { ErrorHandler, useAsync } from "../../lib/async";
import { Tag } from "../tags";

function Loading() {
  return <>Loading.</>;
}

export function LeagueCard({ data }: { data: League }): JSX.Element {
  const api = useContext(API);
  const errorHandler = useContext(ErrorHandler);
  const { loading, error, ok } = useAsync(async () => ({
    firstMatch: await api.match().find({
      query: { league: data._id },
      // sort: { date: Sort.ASC },
      pageSize: 20,
    }),
    picture: await api
      .league()
      .getPictureSrc(data._id)
      .catch(() => undefined as string | undefined),
  }))
    .loading(Loading)
    .catch(errorHandler)
    .await();

  if (!ok) return (loading ?? error) as JSX.Element;

  const date = moment(ok.firstMatch[0].date);
  return (
    <div className="w-full rounded-2xl overflow-clip text-white">
      <div className="grid columns-[min-content_min-content_1fr] grid-rows-2 bg-p-grey-200 p-2">
        <div className="row-start-1 row-end-3 col-start-1 col-end-2 m-2">
          {data.picture ? (
            <img
              src={data.picture}
              alt={`${data.name} picture.`}
              className="h-full aspect-square rounded-2xl"
            />
          ) : null}
        </div>
        <div className="col-start-2 col-end-3 row-start-1 row-end-2 font-title text-[1.6rem] font-bold">
          {data.name}
        </div>
        <div className="col-start-2 col-end-3 row-start-2 row-end-3 font-title text-2xl">
          <Tag sportName={data.sport} />
        </div>
        <div className="col-start-3 col-end-4 row-span-2">
          <div className="date flex flex-col justify-center items-center align-middle">
            <div className="day uppercase">{date.format("ddd")}</div>
            <div className="date font-bold text-5xl">{date.format("DD")}</div>
            <div className="month uppercase">{date.format("MMM")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
