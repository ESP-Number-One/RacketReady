import type { ID } from "@esp-group-one/types";
import {
  ObjectId,
  calculateAverageRating,
  makeImgSrc,
} from "@esp-group-one/types";
import { useSearchParams } from "react-router-dom";
import type { ReactNode } from "react";
import { useCallback, useContext } from "react";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Stars } from "../components/stars";
import { Page } from "../components/page";
import { ProfilePic } from "../components/profile_pic.tsx";
import { API } from "../state/auth.ts";
import { useAsync } from "../lib/async.tsx";
import { CardList } from "../components/card_list.tsx";
import { Tag } from "../components/tags.tsx";
import { Button } from "../components/button.tsx";

export function ProfilePage() {
  const api = useContext(API);
  const [searchParams] = useSearchParams();
  const id: ID | null = searchParams.get("id");

  const { loading, error, ok } = useAsync(async () => {
    if (!id) throw new Error("not even close");
    const objId = new ObjectId(id);

    const user = api.user().getId(objId);

    return { user: await user };
  })
    .catch((err) => <>{err.message}</>)
    .await();

  const nextPage = useCallback(
    async (pageStart: number) => {
      const matches = await api
        .match()
        .find({ query: { players: ok?.user._id }, pageStart });
      return matches.map((m) => {
        return (
          <a
            className="w-full"
            href={`match?id=${m._id.toString()}`}
            key={m._id.toString()}
          >
            <div className="w-full mt-2 rounded-lg bg-p-grey-200 flex p-3 place-items-center">
              <div className="flex-none justify-start">
                <Tag sportName={m.sport} />
              </div>
              <div className="flex-1 text-right font-body text-xl text-white font-bold">
                {moment(m.date).format("DD/MM HH:MM")}
              </div>
            </div>
          </a>
        );
      });
    },
    [api, ok],
  );

  if (!ok) return (loading ?? error) as ReactNode;

  const rating = calculateAverageRating(ok.user.rating);

  return (
    <Page>
      <Page.Header>
        <div className="text-lg w-full">
          <ProfilePic
            image={makeImgSrc(ok.user.profilePicture)}
            sports={ok.user.sports}
          />
        </div>
        <div className="absolute top-0 left-0 p-2">
          <a className="text-white font-bold" href="/search">
            <FontAwesomeIcon icon={faChevronLeft} size="lg" />
          </a>
        </div>
      </Page.Header>
      <Page.Body className="overflow-y-scroll">
        <p className={"text-right font-title pt-2 text-3xl font-bold"}>
          {ok.user.name}
        </p>
        <div className={"flex justify-end"}>
          <Stars rating={rating} disabled={true} size={"lg"} />
        </div>
        <p className={"py-2 px-3 text-center"}>{ok.user.description}</p>
        <Button
          icon={<FontAwesomeIcon icon={faPlus} />}
          backgroundColor="bg-p-grey-200"
        >
          Propose
        </Button>
        <div className="mb-2">
          <CardList nextPage={nextPage} />
        </div>
      </Page.Body>
    </Page>
  );
}
