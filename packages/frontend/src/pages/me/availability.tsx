import type { ReactNode } from "react";
import { useCallback, useContext, useEffect, useState } from "react";
import type { Availability, User } from "@esp-group-one/types";
import moment from "moment";
import { API } from "../../state/auth";
import { useAsync } from "../../lib/async";
import { Form } from "../../components/form";
import { Header } from "../../components/page/header";
import { RadioButton } from "../../components/form/radio_button";
import { Input } from "../../components/form/input";

export interface AvailabilityCreator {
  date: string;
  start: string;
  end: string;
  recurring: number | undefined;
  recurringUnit: string | undefined;
}

export function SetAvailabilityBody({
  info,
  setInfo,
  refresh: parentRefresh,
  setRefresh,
}: {
  info: AvailabilityCreator;
  setInfo: (a: AvailabilityCreator) => void;
  refresh?: () => void;
  setRefresh: (f: () => void) => void;
}) {
  const api = useContext(API);
  const [showRecurring, setShowRecurring] = useState(false);

  const { loading, error, ok, refresh } = useAsync<{
    user: User;
  }>(
    async () => {
      const user = api.user().me();

      return { user: await user };
    },
    { refresh: true },
  )
    .catch((err) => <>{err.message}</>)
    .await();

  useEffect(() => {
    if (!parentRefresh && refresh) setRefresh(refresh);
  }, [parentRefresh, refresh]);

  if (!ok) return (loading ?? error) as ReactNode;

  return (
    <>
      <div className="flex-none">
        <Input
          className="col-span-2 mt-2"
          type="date"
          onChange={(date) => {
            setInfo({ ...info, date });
          }}
          placeholder=""
          value={info.date}
          required
        />

        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <label className="font-body font-bold text-xl" htmlFor="start">
              Start
            </label>
            <Input
              id="start"
              type="time"
              onChange={(start) => {
                setInfo({ ...info, start });
              }}
              placeholder=""
              value={info.start}
              required
            />
          </div>
          <div>
            <div className="flex justify-end">
              <label className="font-body font-bold text-xl" htmlFor="end">
                End
              </label>
            </div>
            <Input
              value={info.end}
              id="end"
              type="time"
              onChange={(end) => {
                setInfo({ ...info, end });
              }}
              placeholder=""
              required
            />
          </div>
        </div>

        <div className="flex mt-2">
          <RadioButton
            label="One time"
            value="once"
            checked={!showRecurring}
            onChange={(v) => {
              setShowRecurring(!v);
            }}
            isFirst
          />
          <RadioButton
            label="Reoccurring"
            value="reoccurring"
            checked={showRecurring}
            isLast
            onChange={(v) => {
              setShowRecurring(v);
            }}
          />
        </div>
        {showRecurring && (
          <div className="flex gap-2 mt-2">
            <div className="relative bg-p-grey-100 text-white rounded-lg p-2 flex-none w-16">
              <input
                className="font-body text-2xl font-bold text-white w-full bg-transparent focus:outline-none inline-flex items-center w-full transform transition duration-150 ease-in-out m-0"
                type="number"
                min={1}
                step={1}
                onChange={(e) => {
                  setInfo({ ...info, recurring: Number(e.target.value) });
                }}
                placeholder="0"
                value={info.recurring ? String(info.recurring) : ""}
              />
            </div>
            <select
              className={`flex-auto text-white font-body text-2xl font-bold bg-p-grey-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg px-5 py-2.5 text-center inline-flex items-center w-full`}
              onChange={(e) => {
                setInfo({ ...info, recurringUnit: e.target.value });
              }}
              value={info.recurringUnit ?? ""}
              required
            >
              <option disabled value="">
                Select interval
              </option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        )}
        <hr className="w-full h-1 bg-black rounded-full mt-2" />
      </div>

      <div className="flex-1 content-end overflow-y-scroll h-full py-2">
        {ok.user.availability
          .sort((a, b) => a.timeStart.localeCompare(b.timeStart))
          .map((a) => (
            <div
              key={`${a.timeStart} ${a.timeEnd}`}
              className="bg-p-grey-200 font-body font-bold rounded-lg w-full py-2 px-4 mt-2 text-white text-xl"
            >
              <div className="w-full flex place-content-center">
                {moment(a.timeStart).format("dddd D/M")}
              </div>
              <div className="w-full flex">
                <p className="text-left flex-auto">
                  {moment(a.timeStart).format("HH:MM")}
                </p>
                <p className="text-right flex-auto">
                  {moment(a.timeEnd).format("HH:MM")}
                </p>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}

export function SetAvailability() {
  const api = useContext(API);

  const [info, setInfo] = useState<AvailabilityCreator>({
    date: "",
    start: "",
    end: "",
    recurring: undefined,
    recurringUnit: undefined,
  });
  const [refresh, setRefresh] = useState<(() => void) | undefined>();

  const onSubmit = useCallback(async () => {
    const { date, start, end, recurring, recurringUnit } = info;

    if (!date || !start || !end)
      throw Error("Required fields were not filled in");

    const req: Availability = {
      timeStart: moment(`${date} ${start}`).toISOString(),
      timeEnd: moment(`${date} ${end}`).toISOString(),
    };

    if (recurring) {
      if (!recurring || !recurringUnit)
        throw Error("Required fields were not filled in");
      req.recurring = {};
      req.recurring[recurringUnit as "days" | "weeks" | "months" | "years"] =
        recurring;
    }

    await api.user().addAvailability(req);
    if (refresh) refresh();

    setInfo({
      date: "",
      start: "",
      end: "",
      recurring: undefined,
      recurringUnit: undefined,
    });
  }, [api, info]);

  return (
    <Form onSubmit={onSubmit}>
      <Form.Header>
        <Header.Back />
        Availability
      </Form.Header>
      <Form.Body>
        <SetAvailabilityBody
          info={info}
          setInfo={setInfo}
          refresh={refresh}
          setRefresh={setRefresh}
        />
      </Form.Body>
    </Form>
  );
}
