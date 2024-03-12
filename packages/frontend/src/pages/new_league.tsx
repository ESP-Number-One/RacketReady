import { useContext, useState } from "react";
import { faBan, faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import type { LeagueCreation } from "@esp-group-one/types";
import { Sport } from "@esp-group-one/types/src/utils";
import { Header } from "../components/page/header";
import { Form } from "../components/form/index";
import { Input } from "../components/form/input";
import { RadioButton } from "../components/form/radio_button";
import { SelectSport } from "../components/form/select_sports";
import { Button } from "../components/button";
import { Icon } from "../components/icon";
import { API } from "../state/auth";

export function NewLeaguePage() {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [visibility, setVisibility] = useState<boolean>(true);
  const api = useContext(API);

  const handleCreateLeague = async () => {
    try {
      // Make sure all required fields are filled
      if (!name || !startDate || !endDate) {
        throw new Error("Please fill in all required fields.");
      }

      // Construct the league object
      const formData: LeagueCreation = {
        name,
        // startDate,
        // endDate,
        // ownerIds: [ok.user._id],
        sport: Sport.Tennis,
        private: !visibility,
      };

      // Call the API to create a new league
      await api.league().create(formData);

      // Redirect or perform any other necessary actions upon successful creation
    } catch (error) {
      console.error("Error creating league:", error);
      // Handle error (e.g., display error message)
    }
  };

  const handleCancel = () => {
    // Handle cancellation (e.g., navigate back)
  };

  return (
    <Form onSubmit={handleCreateLeague}>
      <Form.Header>
        <Header.Back />
        New League
      </Form.Header>

      <Form.Body>
        <SelectSport
          className="mt-2"
          sports={[Sport.Tennis, Sport.Badminton, Sport.Squash]}
          onChange={(sport: Sport) => {
            console.log(sport);
          }}
        />
        <Input
          className="mt-2"
          type="text"
          placeholder="Name"
          initVal={name}
          onChange={setName}
        />
        <Input
          className="mt-2"
          type="date"
          placeholder="Start date"
          initVal={startDate}
          onChange={setStartDate}
        />
        <Input
          className="mt-2"
          type="date"
          placeholder="End date"
          initVal={endDate}
          onChange={setEndDate}
        />
        <div className="flex mt-2">
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

      <Form.Footer>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button onClick={handleCancel} backgroundColor="bg-p-red-100">
            <Icon icon={faBan} style={{ marginRight: "10px" }} /> Cancel
          </Button>
          <Button type="submit">
            <Icon icon={faFloppyDisk} style={{ marginRight: "10px" }} /> Create
          </Button>
        </div>
      </Form.Footer>
    </Form>
  );
}
