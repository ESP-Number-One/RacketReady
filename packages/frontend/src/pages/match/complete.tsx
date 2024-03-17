import type { ReactNode } from "react";
import { useCallback, useContext, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ID, Scores, StarCount } from "@esp-group-one/types";
import { MatchStatus, ObjectId } from "@esp-group-one/types";
import moment from "moment";
import { API } from "../../state/auth";
import { useAsync } from "../../lib/async";
import { Header } from "../../components/page/header";
import { Form } from "../../components/form";
import { Input } from "../../components/form/input";
import { Stars } from "../../components/stars";
import { useViewNav } from "../../state/nav";

export function CompleteMatchForm() {
  const api = useContext(API);
  const [searchParams] = useSearchParams();
  const id: ID | null = searchParams.get("id");

  const viewNav = useViewNav();

  const [scores, setScores] = useState<Scores>({});
  const [rating, setRating] = useState<StarCount>(0 as StarCount);

  const { loading, error, ok } = useAsync(async () => {
    if (!id) throw new Error("not even close");
    const objId = new ObjectId(id);

    const user = await api.user().me();

    const match = await api.match().getId(objId);
    const players = await api
      .user()
      .find({ query: { _id: { $in: match.players } } });
    players.push(user);

    if (
      match.status !== MatchStatus.Accepted ||
      moment(match.date).isAfter(moment())
    )
      throw new Error("Match cannot be completed at the moment");

    return { match, players, user };
  })
    .catch((err) => <>{err.message}</>)
    .await();

  const onSubmit = useCallback(async () => {
    if (!id) throw new Error("not even close");
    const objId = new ObjectId(id);

    await api.match().complete(objId, scores);
    if (rating > 0) await api.match().rate(objId, rating);
    viewNav("/");
  }, [api, id, rating, ok]);

  if (!ok) return (loading ?? error) as ReactNode;

  return (
    <Form onSubmit={onSubmit}>
      <Form.Header>
        <Header.Back defaultLink={`/match?id=${ok.match._id.toString()}`} />
        Complete your match!
      </Form.Header>
      <Form.Body>
        {ok.players.map((p) => (
          <div key={p._id.toString()} className="flex w-full gap-2">
            <Input type="text" disabled value={p.name} className="flex-auto" />
            <input
              type="number"
              step={1}
              min={1}
              className="rounded-lg p-2 text-lg bg-p-grey-100 flex-none w-16"
              onChange={(e) => {
                scores[p._id.toString()] = Number(e.target.value);
                setScores(scores);
              }}
            />
          </div>
        ))}
        <div className="flex place-content-center w-full">
          <Stars
            rating={rating}
            onRatingChange={(r) => {
              setRating(r);
            }}
          />
        </div>
      </Form.Body>
    </Form>
  );
}
