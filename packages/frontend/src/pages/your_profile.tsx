import type { ReactNode } from "react";
import { useContext } from "react";
import { calculateAverageRating, makeImgSrc } from "@esp-group-one/types";
import {
  faCalendar,
  faGear,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "../components/button.tsx";
import { ProfilePic } from "../components/profile_pic.tsx";
import { Page } from "../components/page";
import { Stars } from "../components/stars";
import { API } from "../state/auth.ts";
import { useAsync } from "../lib/async.tsx";
import { useViewNav } from "../state/nav.ts";

export function YourProfile() {
  const viewNav = useViewNav();
  const api = useContext(API);

  const { loading, error, ok } = useAsync(async () => {
    const user = api.user().me();

    return { user: await user };
  })
    .catch((err) => <>{err.message}</>)
    .await();

  if (!ok) return (loading ?? error) as ReactNode;

  return (
    <Page>
      <Page.Header>
        <ProfilePic
          image={makeImgSrc(ok.user.profilePicture)}
          sports={ok.user.sports}
        />
      </Page.Header>
      <Page.Body className="overflow-y-scroll">
        <p className="text-right font-title pt-2 px-3 text-3xl font-bold">
          {ok.user.name}
        </p>
        <div className="flex justify-end">
          <Stars
            rating={calculateAverageRating(ok.user.rating)}
            disabled
            size="lg"
          />
        </div>
        <p className="py-2 px-3 text-center">{ok.user.description}</p>
        <div className="flex flex-col space-y-2 mb-2">
          <Button
            backgroundColor="bg-p-grey-100"
            icon={<FontAwesomeIcon className={"mr-2"} icon={faCalendar} />}
            onClick={() => {
              viewNav("/me/availability");
            }}
          >
            Calendar
          </Button>
          <Button
            backgroundColor="bg-p-grey-100"
            icon={<FontAwesomeIcon className={"mr-2"} icon={faPenToSquare} />}
            onClick={() => {
              viewNav("/me/edit");
            }}
          >
            Edit Profile
          </Button>
          <Button
            backgroundColor="bg-p-grey-100"
            icon={<FontAwesomeIcon className={"mr-2"} icon={faGear} />}
            onClick={() => {
              viewNav("/settings");
            }}
          >
            Settings
          </Button>
        </div>
      </Page.Body>
    </Page>
  );
}
