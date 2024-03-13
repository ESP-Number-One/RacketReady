// code your profile page
import { Stars } from "../components/stars";
import { useViewNav } from "../state/nav";
import { Page } from "../components/page";
import { useState } from "react";
import { ProfilePic } from "../components/profile_pic.tsx";
import { AbilityLevel, Sport } from "@esp-group-one/types";
import { PICTURES } from "@esp-group-one/types/build/tests/helpers/utils";
import { Button } from "../components/button.tsx";
import {
  faCalendar,
  faGear,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

export function YourProfile() {
  const [rating, setRating] = useState(4);
  const viewNavigate = useViewNav();

  const navigate = useNavigate();

  return (
    <Page>
      <Page.Header>
        <ProfilePic
          image={`data:image/webp;base64,${PICTURES[0]}`}
          sports={[{ sport: Sport.Tennis, ability: AbilityLevel.Beginner }]}
        />
      </Page.Header>
      <Page.Body>
        <p className={"text-right font-title py-2 px-3 text-3xl font-bold"}>
          Name
        </p>
        <div className={"flex justify-end "}>
          <Stars
            rating={rating}
            onRatingChange={setRating}
            disabled={true}
            size={"lg"}
          />
        </div>
        <p className={"py-2 px-3 text-center"}>Description</p>
        <div className={"flex flex-col space-y-4"}>
          <Button
            backgroundColor={"bg-p-grey-100"}
            onClick={() => navigate("/calendar")}
          >
            <FontAwesomeIcon className={"mr-2"} icon={faCalendar} />
            Calendar
          </Button>
          <Button
            backgroundColor={"bg-p-grey-100"}
            onClick={() => navigate("/editProfile")}
          >
            <FontAwesomeIcon className={"mr-2"} icon={faPenToSquare} />
            Edit Profile
          </Button>
          <Button
            backgroundColor={"bg-p-grey-100"}
            onClick={() => navigate("/settings")}
          >
            <FontAwesomeIcon className={"mr-2"} icon={faGear} />
            Settings
          </Button>
        </div>
      </Page.Body>
      <Page.Footer>
        <button
          onClick={() => {
            viewNavigate("/");
          }}
        >
          First Test page
        </button>
        <button
          onClick={() => {
            viewNavigate("/another");
          }}
        >
          Another page.
        </button>
        <button
          onClick={() => {
            viewNavigate("/profile");
          }}
        >
          Profile
        </button>
      </Page.Footer>
    </Page>
  );
}
