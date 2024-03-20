import { useContext, useState } from "react";
import type { LeagueCreation } from "@esp-group-one/types";
import { Sport } from "@esp-group-one/types/src/utils";
import { Header } from "../../components/page/header";
import { Form } from "../../components/form/index";
import { Input } from "../../components/form/input";
import { RadioButton } from "../../components/form/radio_button";
import { SelectSport } from "../../components/form/select_sports";
import { API } from "../../state/auth";
import { ProfilePicturePicker } from "../../components/form/profile_picture";
import { useViewNav } from "../../state/nav";

export function NewLeaguePage() {
  const api = useContext(API);
  const viewNav = useViewNav();

  const [name, setName] = useState("");
  const [sport, setSport] = useState<Sport | undefined>();
  const [visibility, setVisibility] = useState(true);
  const [profilePic, setProfilePic] = useState("");

  const handleCreateLeague = async () => {
    if (!name || !profilePic) {
      throw new Error("Please fill in all required fields.");
    }

    const formData: LeagueCreation = {
      name,
      picture: profilePic,
      private: !visibility,
      sport: Sport.Tennis,
    };

    const res = await api.league().create(formData);
    viewNav(`/league/${res._id.toString()}`);
  };

  return (
    <Form onSubmit={handleCreateLeague}>
      <Form.Header>
        <Header.Back defaultLink="/leagues" />
        New League
      </Form.Header>

      <Form.Body spacing>
        <SelectSport
          sports={Object.keys(Sport) as Sport[]}
          onChange={setSport}
          value={sport}
        />

        <ProfilePicturePicker onChange={setProfilePic} required />

        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={setName}
          required
        />

        <div className="flex">
          <RadioButton
            name="visibility"
            value="public"
            label="Public"
            checked={visibility}
            onChange={() => {
              setVisibility(true);
            }}
            isFirst
          />

          <RadioButton
            name="visibility"
            value="private"
            label="Private"
            checked={!visibility}
            onChange={() => {
              setVisibility(false);
            }}
            isLast
          />
        </div>
      </Form.Body>
    </Form>
  );
}
