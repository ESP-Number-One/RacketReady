import type { MutableRefObject, ReactNode } from "react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Availability, Duration, User } from "@esp-group-one/types";
import type { unitOfTime } from "moment";
import moment from "moment";
import Select from "react-select";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { API } from "../../state/auth";
import { useAsync } from "../../lib/async";
import { Form } from "../../components/form";
import { Header } from "../../components/page/header";
import { RadioButton } from "../../components/form/radio_button";
import { Feed } from "../../components/card/feed";

export interface AvailabilityCreator {
  date: string[];
  start: string;
  end: string;
  recurring: number | undefined;
  recurringUnit: string | undefined;
}

type RecurringAvailability = Availability & { recurring: Duration };

export function NewForm({
  info,
  setInfo,
}: {
  info: AvailabilityCreator;
  setInfo: (a: AvailabilityCreator) => void;
}) {
  const now = moment();

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const options = days.map((label, i) => {
    let date = moment().day(i + 1);
    if (date.isBefore(now)) {
      date = date.add(1, "week");
    }
    return {
      value: date.toISOString(),
      label,
    };
  });

  return (
    <div className="flex-none">
      <Select
        isMulti
        options={options}
        className="w-full mt-2"
        onChange={(selected) => {
          setInfo({
            ...info,
            date: selected.map((s) => s.value),
            recurring: 1,
            recurringUnit: "weeks",
          });
        }}
        placeholder="Day of the week"
        required
      />

      <div className="grid grid-cols-2 gap-2 mt-2">
        <div>
          <TimePicker
            label="Start time"
            onChange={(start) => {
              setInfo({ ...info, start: start?.format("HH:mm") ?? "" });
            }}
            defaultValue={moment(info.start)}
          />
        </div>
        <div>
          <div className="flex justify-end">
            <TimePicker
              label="End time"
              onChange={(end) => {
                setInfo({ ...info, end: end?.format("HH:mm") ?? "" });
                return undefined;
              }}
              defaultValue={moment(info.end)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function OldForm({
  info,
  setInfo,
}: {
  info: AvailabilityCreator;
  setInfo: (a: AvailabilityCreator) => void;
}) {
  const [showRecurring, setShowRecurring] = useState(false);

  return (
    <div className="flex-none mt-2 w-full">
      <DatePicker
        className="col-span-2 mt-4 w-full"
        label="Availability Date"
        value={moment(info.date[0])}
        onChange={(date) => {
          setInfo({
            ...info,
            date: [date?.format("YYYY-MM-DD") ?? ""],
          });
        }}
      />

      <div className="grid grid-cols-2 gap-2 mt-2">
        <div>
          <TimePicker
            label="Start time"
            onChange={(start) => {
              setInfo({ ...info, start: start?.format("HH:mm:ss") ?? "" });
              return undefined;
            }}
            defaultValue={moment(info.start)}
          />
        </div>
        <div>
          <TimePicker
            label="End time"
            onChange={(end) => {
              setInfo({ ...info, end: end?.format("HH:mm:ss") ?? "" });
              return undefined;
            }}
            defaultValue={moment(info.end)}
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
              className="font-body text-2xl font-bold text-white bg-transparent focus:outline-none inline-flex items-center w-full transform transition duration-150 ease-in-out m-0"
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
            className="flex-auto text-white font-body text-2xl font-bold bg-p-grey-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg px-5 py-2.5 text-center inline-flex items-center w-full"
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
  );
}

export function SetAvailabilityBody({
  info,
  setInfo,
  refresh: parentRefresh,
}: {
  info: AvailabilityCreator;
  setInfo: (a: AvailabilityCreator) => void;
  refresh: MutableRefObject<(() => void) | undefined>;
}) {
  const api = useContext(API);

  const lastPage = useRef<number>(-1);
  const availability = useRef<Availability[]>([]);
  const recurringAvailability = useRef<RecurringAvailability[]>([]);
  const [refreshSignal, setRefreshSignal] = useState<boolean>(false);

  const { loading, error, ok, refresh } = useAsync<{
    user: User;
  }>(
    async () => {
      const user = await api.user().me();

      const avail = user.availability.sort((a, b) =>
        a.timeStart.localeCompare(b.timeStart),
      );
      availability.current = avail.filter((a) => !("recurring" in a));
      recurringAvailability.current = avail.filter(
        (a) => "recurring" in a,
      ) as RecurringAvailability[];

      return { user };
    },
    { refresh: true },
  )
    .catch((err) => <>{err.message}</>)
    .await();

  useEffect(() => {
    setRefreshSignal(!refreshSignal);
  }, [setRefreshSignal, ok]);

  useEffect(() => {
    if (refresh) {
      parentRefresh.current = () => {
        refresh();
      };
    }
  }, [parentRefresh, refresh]);

  const nextPage = useCallback((page: number) => {
    if (page === 0) lastPage.current = 0;

    return new Promise<ReactNode[]>((resolve) => {
      const weekAvailabilities: Availability[] = [];
      let tryNextPage = true;
      while (tryNextPage) {
        tryNextPage = recurringAvailability.current.length > 0;

        // loads a week at a time and handles the recurring nature
        const endWeek = moment().endOf("week").add(lastPage.current, "weeks");
        const startWeek = endWeek.clone().startOf("week");
        for (const a of availability.current) {
          if (endWeek.isBefore(a.timeStart)) {
            tryNextPage = true;
            break;
          }
          if (startWeek.isAfter(a.timeEnd)) continue;
          weekAvailabilities.push(a);
        }

        const newRec: RecurringAvailability[] = [];
        for (const rec of recurringAvailability.current) {
          let recStart = moment(rec.timeStart);
          const recDur = recStart.diff(rec.timeEnd);

          while (startWeek.isAfter(recStart)) {
            for (const [unit, amount] of Object.entries(rec.recurring)) {
              recStart = recStart.add(
                amount as number,
                unit as unitOfTime.DurationConstructor,
              );
            }
          }

          const nextAvail = {
            recurring: rec.recurring,
            timeStart: recStart.toISOString(),
            timeEnd: recStart.add(recDur).toISOString(),
          };

          if (endWeek.isAfter(recStart)) {
            weekAvailabilities.push(nextAvail);
          }

          newRec.push(nextAvail);
        }
        recurringAvailability.current = newRec;

        if (weekAvailabilities.length > 0) tryNextPage = false;
        lastPage.current++;
      }

      resolve(
        weekAvailabilities
          .sort((a, b) => a.timeStart.localeCompare(b.timeStart))
          .map((a) => (
            <div
              key={`${a.timeStart} ${a.timeEnd}`}
              className="bg-p-grey-200 font-body font-bold rounded-lg w-full py-2 px-4 mt-2 text-white text-xl h-min"
            >
              <div className="w-full flex place-content-center">
                {moment(a.timeStart).format("dddd D/M")}
              </div>
              <div className="w-full flex">
                <p className="text-left flex-auto">
                  {moment(a.timeStart).format("HH:mm")}
                </p>
                <p className="text-right flex-auto">
                  {moment(a.timeEnd).format("HH:mm")}
                </p>
              </div>
            </div>
          )),
      );
    });
  }, []);

  if (!ok) return (loading ?? error) as ReactNode;

  return (
    <>
      {window.__SHOW_ALT_AVAIL__ ? (
        <NewForm info={info} setInfo={setInfo} />
      ) : (
        <OldForm info={info} setInfo={setInfo} />
      )}

      <div className="flex-1 overflow-y-scroll py-2">
        <Feed pageSize={0} nextPage={nextPage} refreshSignal={refreshSignal} />
      </div>
    </>
  );
}

export function SetAvailability() {
  const api = useContext(API);

  const [info, setInfo] = useState<AvailabilityCreator>({
    date: window.__SHOW_ALT_AVAIL__ ? [] : [""],
    start: "",
    end: "",
    recurring: undefined,
    recurringUnit: undefined,
  });

  const refresh = useRef<(() => void) | undefined>();

  const onSubmit = useCallback(async () => {
    await Promise.all(
      info.date.map(async (date) => {
        const { start, end, recurring, recurringUnit } = info;
        console.log({ start, end, date });

        if (!date || !start || !end)
          throw Error("Required fields were not filled in");

        const req: Availability = {
          timeStart: moment(
            `${moment(date).format("YYYY-MM-DD")} ${start}`,
          ).toISOString(),
          timeEnd: moment(
            `${moment(date).format("YYYY-MM-DD")} ${end}`,
          ).toISOString(),
        };

        if (recurring) {
          if (!recurring || !recurringUnit)
            throw Error("Required fields were not filled in");
          req.recurring = {};
          req.recurring[
            recurringUnit as "days" | "weeks" | "months" | "years"
          ] = recurring;
        }

        await api.user().addAvailability(req);
      }),
    );

    if (refresh.current) refresh.current();

    setInfo({
      date: window.__SHOW_ALT_AVAIL__ ? [] : [""],
      start: "",
      end: "",
      recurring: undefined,
      recurringUnit: undefined,
    });
  }, [api, info]);

  return (
    <Form onSubmit={onSubmit}>
      <Form.Header>
        <Header.Back defaultLink="/me" />
        Availability
      </Form.Header>
      <Form.Body>
        <SetAvailabilityBody info={info} setInfo={setInfo} refresh={refresh} />
      </Form.Body>
    </Form>
  );
}
