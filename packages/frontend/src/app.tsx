import { Sport } from "@esp-group-one/types";
import moment from "moment";
import { MatchCard } from "./components/matchcard.js";
import { PageWithTitle } from "./components/page.js";

export function App() {
  return (
    <PageWithTitle
      currPage="home"
      disableAuth
      heading="Testing"
      setAPI={console.log}
    >
      <MatchCard
        sportsTag={Sport.Squash}
        profilePic="https://trello.com/1/cards/65d51a05435c78cb5cb4eacf/attachments/65d51a18f3adf7a593ce5788/download/image.png"
        name="Sammy N"
        startTime={moment("2024-02-22 15:15:00")} //assuming times passed from backend is formatted correctly
        endTime={moment("2024-02-22 17:15:00")}
        link="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      />
    </PageWithTitle>
  );
}
