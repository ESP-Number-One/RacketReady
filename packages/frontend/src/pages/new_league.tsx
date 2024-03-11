import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faFile,
  faFloppyDisk,
  faPlus,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import * as React from "react";
import { Stars } from "../components/page/stars"; // Assuming Stars is still relevant
import { Page } from "../components/page";
import { Header } from "../components/page/header";
import { useViewNav } from "../state/nav";
import { Form } from "../components/form/index";
import { Input } from "../components/form/input";
import { RadioButton } from "../components/form/radio_button";
import { SelectSport } from "../components/form/select_sports";
import { Button } from "../components/button"; // Import Button component
import { Icon } from "../components/icon";
import { Sport } from "../../../types/src/utils"; // Update this path

export function NewLeaguePage() {
  const viewNavigate = useViewNav();

  /*const handleCreateLeague = async () => {
    try {
      await api.leagues().new(formData);
      // Navigate to a success page or perform other actions after creation
    } catch (error) {
      // Handle errors
      console.error("Error creating league:", error);
    }
  };*/

  const handleCancel = () => {
    viewNavigate("/test"); //UPDATE THIS
  };

  const [selectedOption, setSelectedOption] = React.useState("public");

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };

  const sportsOptions: Sport[] = [Sport.Badminton, Sport.Tennis, Sport.Squash];
  const currentSport: Sport = sportsOptions[0];

  return (
    <Page>
      <Page.Header>
        <Header.Back />
        New League
        <Header.Right>
          {/* Adjust as needed */}
          <FontAwesomeIcon icon={faPlus} />
        </Header.Right>
      </Page.Header>

      <Page.Body>
        <SelectSport sports={sportsOptions} currentSport={currentSport} />
        <Input type="text" placeholder="Name" />
        <Input type="date" placeholder="Start date" />
        <Input type="date" placeholder="End date" />
        <div className="flex">
          <RadioButton
            name="visibility"
            value="public"
            label="Public"
            checked={selectedOption === "public"}
            onChange={handleOptionChange}
            isFirst
          />
          <RadioButton
            name="visibility"
            value="private"
            label="Private"
            checked={selectedOption === "private"}
            onChange={handleOptionChange}
            isLast
          />
        </div>
      </Page.Body>

      <Page.Footer>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
          <Button onClick={handleCancel} backgroundColor="bg-p-red-100">
            <Icon icon={faBan} style={{ marginRight: "10px" }} /> Cancel
          </Button>
          <Button onClick={handleCancel}>
            <Icon icon={faFloppyDisk} style={{ marginRight: "10px" }} /> Create
          </Button>
        </div>
      </Page.Footer>
    </Page>
  );
}
