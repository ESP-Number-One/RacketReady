import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faFloppyDisk, faPlus } from "@fortawesome/free-solid-svg-icons";
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
// import { api } from "../lib/api"; // Assuming this is your API client (commented out)

export function NewLeaguePage() {
  const viewNavigate = useViewNav();
  const formRef = useRef(null); // Ref to access Form component instance

  const [selectedOption, setSelectedOption] = useState("public");

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };

  const sportsOptions: Sport[] = [Sport.Badminton, Sport.Tennis, Sport.Squash];
  const currentSport: Sport = sportsOptions[0];

  const handleCreateLeague = async () => {
    try {
      if (!formRef.current) return; // Check if form ref is available
      // **Commented out API call**
      // await api.leagues().new(formRef.current.formData);
      console.log("League creation successful (simulated)"); // Placeholder
      // Navigate to a success page or perform other actions after creation
    } catch (error) {
      console.error("Error creating league:", error);
      // Display error message to the user
      formRef.current?.setError(error.toString()); // Optional chaining
    }
  };

  const handleCancel = () => {
    viewNavigate("/leagus"); // UPDATE THIS if needed
  };

  const handleCreateButtonClick = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

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
        <Form onSubmit={handleCreateLeague}>
          <div style={{ padding: "10px 0" }} /> {/* Empty div with padding */}
          <SelectSport sports={sportsOptions} currentSport={currentSport} />
          <div style={{ padding: "10px 0" }} /> {/* Empty div with padding */}
          <Input type="text" placeholder="Name" />
          <div style={{ padding: "10px 0" }} /> {/* Empty div with padding */}
          <Input type="date" placeholder="Start date" />
          <div style={{ padding: "10px 0" }} /> {/* Empty div with padding */}
          <Input type="date" placeholder="End date" />
          <div style={{ padding: "10px 0" }} /> {/* Empty div with padding */}
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
        </Form>
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
          <Button onClick={handleCreateButtonClick}>
            <Icon icon={faFloppyDisk} style={{ marginRight: "10px" }} /> Create
          </Button>
        </div>
      </Page.Footer>
    </Page>
  );
}
