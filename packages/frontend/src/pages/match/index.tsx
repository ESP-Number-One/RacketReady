import type { FormEventHandler, ReactNode } from "react";
import { createRef, useCallback, useContext, useEffect, useState } from "react";
import type {
  CensoredUser,
  Match,
  StarCount,
  User,
} from "@esp-group-one/types";
import { MatchStatus, ObjectId } from "@esp-group-one/types";
import {
  faCancel,
  faPaperPlane,
  faStar,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams } from "react-router-dom";
import moment from "moment";
import { twMerge } from "tailwind-merge";
import { useViewNav } from "../../state/nav";
import { Button } from "../../components/button";
import { Tag } from "../../components/tags";
import { API } from "../../state/auth";
import { ErrorDiv } from "../../components/error";
import { Message } from "../../components/message";
import { Page } from "../../components/page";
import { Header } from "../../components/page/header";
import { Input } from "../../components/form/input";
import { Link } from "../../components/link";
import { Stars } from "../../components/stars";
import { useAsync } from "../../lib/async";
import { Modal } from "../../lib/modal";

export function SingleMatchPage(): ReactNode {
  const api = useContext(API);
  const { id } = useParams();

  const [message, setMessage] = useState("");
  const [myError, setError] = useState("");
  const [showRating, setShowRating] = useState(false);
  const [disableMessage, setDisableMessage] = useState(true);

  const { loading, error, ok, refresh } = useAsync<{
    user: User;
    opponent: CensoredUser;
    match: Match;
  }>(
    async () => {
      if (!id) throw new Error("not even close");
      const objId = new ObjectId(id);

      const user = await api.user().me();

      const match = await api.match().getId(objId);
      const opponent = api
        .user()
        .getId(match.players.filter((i) => !i.equals(user._id))[0]);

      setDisableMessage(match.status !== MatchStatus.Accepted);

      return { match, opponent: await opponent, user };
    },
    { refresh: true },
  )
    .catch((err) => <>{err.message}</>)
    .await();

  const viewNavigate = useViewNav();

  const messagesRef = createRef<HTMLDivElement>();
  const scrollToBottom = () => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  };

  const setErrorFromError = (e: Error) => {
    setError(e.toString());
  };

  const cancelMatch = useCallback(() => {
    const deleteMatch = () =>
      api
        .match()
        .cancel(new ObjectId(id ?? ""))
        .then(() => {
          viewNavigate("/");
        })
        .catch(setErrorFromError);

    if (window.__CONFIRM_CANCEL__) {
      void Modal.confirm(
        [
          { id: "no", label: "No, Keep", type: "other" },
          { id: "yes", label: "Yes", type: "primary" },
        ] as const,
        "Are you sure you want to cancel the match?",
        "Cancel match?",
      ).then((t) => {
        if (t === "yes") {
          void deleteMatch();
        }
      });
    } else {
      void deleteMatch();
    }
  }, []);

  const sendMessage: FormEventHandler<HTMLFormElement> = useCallback(
    (e) => {
      e.preventDefault();
      console.log("Sending message?");
      setDisableMessage(true);

      const objId = new ObjectId(id ?? "");
      api
        .match()
        .message(objId, message)
        .then(() => {
          if (refresh) refresh();
          setMessage("");
        })
        .catch(setErrorFromError)
        .finally(() => {
          setDisableMessage(!ok || ok.match.status !== MatchStatus.Accepted);
        });
    },
    [api, id, message, setError],
  );

  const rateMatch = useCallback((stars: StarCount) => {
    api
      .match()
      .rate(new ObjectId(id ?? ""), stars)
      .then(refresh)
      .catch(setErrorFromError);
  }, []);

  useEffect(scrollToBottom, [messagesRef.current]);

  if (!ok)
    return (
      <Page page="home">
        <Page.Body>{(loading ?? error) as ReactNode}</Page.Body>
      </Page>
    );

  const isLeague = "league" in ok.match;
  const hasRated =
    ok.match.status === MatchStatus.Complete &&
    ok.match.usersRated
      .map((e) => e.toString())
      .includes(ok.user._id.toString());

  let lastButton: ReactNode;

  if (ok.match.status === MatchStatus.Complete) {
    if (!hasRated) {
      if (showRating) {
        lastButton = (
          <div className="flex place-content-center w-full mt-2">
            <Stars rating={0 as StarCount} onRatingChange={rateMatch} />
          </div>
        );
      } else {
        lastButton = (
          <Button
            className="mt-2"
            icon={<FontAwesomeIcon icon={faStar} />}
            onClick={() => {
              setShowRating(!showRating);
            }}
          >
            Rate
          </Button>
        );
      }
    }
  } else if (moment(ok.match.date).isBefore(moment())) {
    lastButton = (
      <Button
        className="mt-2"
        onClick={() => {
          viewNavigate(`/match/complete?id=${ok.match._id.toString()}`);
        }}
      >
        Complete
      </Button>
    );
  } else {
    lastButton = (
      <Button
        backgroundColor="bg-p-red-200"
        className="mt-2"
        icon={<FontAwesomeIcon icon={faCancel} />}
        onClick={cancelMatch}
      >
        Cancel
      </Button>
    );
  }

  return (
    <Page>
      <Page.Header>
        <Header.Back defaultLink="/" />
        <div className="flex flex-col place-items-centre">
          <div className="leading-none">
            {moment(ok.match.date).format("dddd")}
          </div>
          <div className="text-lg text-center leading-none">
            {moment(ok.match.date).format("HH:mm")}
          </div>
        </div>
      </Page.Header>
      <Page.Body flexCol>
        <div className="flex-none">
          <ErrorDiv className="mt-2" error={myError} />
          <div className="pt-2">
            <Link
              className="bg-p-grey-100 mt-2 font-body text-2xl font-bold text-white focus:outline-none px-5 py-2.5 inline-flex items-center w-full transform active:scale-95 transition duration-150 ease-in-out"
              href={`${ok.opponent._id}`}
            >
              {ok.opponent.name}
            </Link>
            {isLeague && (
              <Button
                backgroundColor="bg-p-grey-100"
                className="mt-2"
                icon={<FontAwesomeIcon icon={faTrophy} />}
                onClick={() => {
                  viewNavigate("/league");
                }}
              >
                League
              </Button>
            )}
            {lastButton}
          </div>
          <hr className="w-full h-1 bg-black rounded-full mt-2" />
        </div>

        <div
          ref={messagesRef}
          className="flex-1 content-end overflow-y-scroll h-full py-2"
        >
          <div className="w-full flex justify-end">
            <Tag sportName={ok.match.sport} />
          </div>
          {ok.match.messages.map((m) => {
            const isIncoming =
              m.sender.toString() === ok.opponent._id.toString();
            return (
              <div
                key={m.date}
                className={twMerge(
                  "flex w-full pt-1",
                  isIncoming ? "justify-start" : "justify-end",
                )}
              >
                <Message isIncoming={isIncoming} message={m.text} />
              </div>
            );
          })}
        </div>
      </Page.Body>
      <Page.Footer padding>
        {ok.match.status === MatchStatus.Accepted && (
          <form className="flex text-base gap-2" onSubmit={sendMessage}>
            <Input
              className="text-sm flex-1"
              disabled={disableMessage}
              onChange={setMessage}
              placeholder={`Message ${ok.opponent.name}`}
              type="text"
              value={message}
            />
            <div className="flex-none w-16">
              <Button
                className="flex-none w-16"
                disabled={disableMessage}
                icon={<FontAwesomeIcon icon={faPaperPlane} />}
                type="submit"
              />
            </div>
          </form>
        )}
      </Page.Footer>
    </Page>
  );
}
