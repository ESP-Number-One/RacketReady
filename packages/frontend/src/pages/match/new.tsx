import type { ReactNode } from "react";
import { useCallback, useContext, useState } from "react";
import type { ID, MatchProposal, Sport, User } from "@esp-group-one/types";
import { ObjectId } from "@esp-group-one/types";
import AsyncSelect from "react-select/async";
import moment from "moment";
import { useSearchParams } from "react-router-dom";
import { Form } from "../../components/form";
import { API } from "../../state/auth";
import { Header } from "../../components/page/header";
import { SelectSport } from "../../components/form/select_sports";
import { useAsync } from "../../lib/async";
import { Input } from "../../components/form/input";
import { useViewNav } from "../../state/nav";

export function NewMatchPage() {
  const api = useContext(API);

  const [searchParams] = useSearchParams();
  const to: ID | null = searchParams.get("to");

  const [sport, setSport] = useState<Sport | undefined>();
  const [opponent, setOpponent] = useState<ObjectId | undefined>(
    to ? new ObjectId(to) : undefined,
  );
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [myError, setMyError] = useState<string>("");
  const viewNav = useViewNav();

  const onSubmit = useCallback(async () => {
    if (!date || !time || !sport || !opponent) {
      throw new Error("Not all required fields were filled in!");
    }

    const datetime = moment(`${date} ${time}`);
    const req: MatchProposal = {
      date: datetime.toISOString(),
      to: opponent,
      sport,
    };

    await api
      .match()
      .create(req)
      .then(() => {
        viewNav("/");
      });
  }, [api, sport, opponent, date, time]);

  const loadPeople = useCallback(
    (
      inputValue: string,
      callback: (options: { label: string; value: string }[]) => void,
    ) => {
      api
        .user()
        .find({
          query: { profileText: inputValue, sports: sport },
          pageSize: 10,
        })
        .then((people) => {
          callback(
            people.map((u) => {
              return { label: u.name, value: u._id.toString() };
            }),
          );
        })
        .catch((e: Error) => {
          setMyError(e.toString());
        });
    },
    [api, sport],
  );

  const { loading, error, ok } = useAsync<{
    user: User;
  }>(async () => {
    const user = api.user().me();

    return { user: await user };
  })
    .catch((err) => <>{err.message}</>)
    .await();

  if (!ok) return (loading ?? error) as ReactNode;

  return (
    <Form onSubmit={onSubmit} parentError={myError}>
      <Form.Header>
        <Header.Back defaultLink="/" />
        Propose Match
      </Form.Header>
      <Form.Body>
        <SelectSport
          sports={ok.user.sports.map((info) => info.sport)}
          onChange={setSport}
          value={sport}
        />
        {sport && (
          <>
            {!to && (
              <AsyncSelect
                loadOptions={loadPeople}
                onChange={(val) => {
                  setOpponent(new ObjectId(val?.value ?? ""));
                }}
                required
              />
            )}

            <Input
              type="date"
              onChange={setDate}
              value={date}
              placeholder="Select date for the match"
              required
            />

            <Input
              type="time"
              onChange={setTime}
              placeholder="Select date for the match"
              value={time}
              required
            />
          </>
        )}
      </Form.Body>
    </Form>
  );
}
