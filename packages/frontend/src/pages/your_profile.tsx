// code your profile page
import { Stars } from "../components/stars";
import { useViewNav } from "../state/nav";
import { Page } from "../components/page";
import { useState } from "react";
import { Profile } from "../components/profile.tsx";
import { RadioButton } from "../components/radio_button.tsx";

export function YourProfile() {
  const [rating, setRating] = useState(4);
  const viewNavigate = useViewNav();

  return (
    <Page>
      <Page.Body>
        <Profile imgSrc={"data:image/png;base64"} />
        <p>background picture (profile picture component)</p>
        <p>sports</p>
        <p>Level</p>
        <p>Name</p>
        <Stars rating={rating} onRatingChange={setRating} />
        <p>Description</p>
        <RadioButton name={"Hugo"} value={"Tennis"} />
        <p>Calendar (buttons component)</p>
        <p>Edit Profile</p>
        <p>Settings</p>
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
