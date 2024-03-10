import type { ReactNode } from "react";
import { useCallback, useContext, useState } from "react";
import type { MatchProposal, Sport, User } from "@esp-group-one/types";
import { ObjectId } from "@esp-group-one/types";
import AsyncSelect from "react-select/async";
import moment from "moment";
import { Form } from "../../components/form";
import { API } from "../../state/auth";
import { Header } from "../../components/page/header";
import { SelectSport } from "../../components/form/select_sports";
import { useAsync } from "../../lib/async";
import { Input } from "../../components/form/input";
import { useViewNav } from "../../state/nav";

export function NewMatchPage() {
  const api = useContext(API);

  const [sport, setSport] = useState<Sport | undefined>();
  const [opponent, setOpponent] = useState<ObjectId | undefined>();
  const [date, setDate] = useState<string | undefined>();
  const [time, setTime] = useState<string | undefined>();
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
        <Header.Back />
        Propose Match
      </Form.Header>
      <Form.Body>
        <SelectSport
          className="mt-2"
          sports={ok.user.sports.map((info) => info.sport)}
          onChange={setSport}
        />
        {sport && (
          <>
            <AsyncSelect
              className="mt-2"
              loadOptions={loadPeople}
              onChange={(val) => {
                setOpponent(new ObjectId(val?.value ?? ""));
              }}
              required
            />

            <Input
              className="mt-2"
              type="date"
              onChange={(val) => {
                setDate(val);
              }}
              placeholder="Select date for the match"
              required
            />

            <Input
              className="mt-2"
              type="time"
              onChange={(val) => {
                setTime(val);
              }}
              placeholder="Select date for the match"
              required
            />
          </>
        )}
      </Form.Body>
    </Form>
  );
}
