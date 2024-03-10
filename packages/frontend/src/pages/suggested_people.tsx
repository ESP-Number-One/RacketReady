import { AbilityLevel, ObjectId, Sport } from "@esp-group-one/types";
import { useRef } from "react";
import { Page } from "../components/page";
import { useViewNav } from "../state/nav";
import { RecProfile } from "../components/rec_profile";
import { Search } from "../components/search";

export function TestPage() {
  const viewNavigate = useViewNav();
  const cardRef = useRef<HTMLDivElement>(null);

  const cards = [
    <RecProfile
      key={1}
      user={{
        _id: new ObjectId("1234567890ABCDEF12345678"),
        name: "Test User",
        description:
          "Lorem ipsum dolor sit amet... filler description. This description is long enough to take up three lines in XL fontsize, so the line clamping should take effect and replace everything beyond the 3rd line with an ellipsis",
        profilePicture:
          "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fnwscdn.com%2Fmedia%2Fcatalog%2Fproduct%2Fv%2Fe%2Fvermont-colt-is-a-tennis-racket-for-all-ages-to-enjoy_1.jpg&f=1&nofb=1&ipt=b2eea9ca10d0036a1d54b51800fde8f724ce5c9b87814ce135014d67cc074a17&ipo=images",
        email: "test_email+1234@example.com",
        sports: [
          { sport: Sport.Badminton, ability: AbilityLevel.Beginner },
          { sport: Sport.Tennis, ability: AbilityLevel.Intermediate },
          { sport: Sport.Squash, ability: AbilityLevel.Advanced },
        ],
        availability: [
          {
            timeStart: "2024-03-10T14:30:00",
            timeEnd: "2024-03-10T15:30:00",
          },
          {
            timeStart: "2024-03-10T14:30:00",
            timeEnd: "2024-03-10T15:30:00",
          },
          {
            timeStart: "2024-03-10T14:30:00",
            timeEnd: "2024-03-10T15:30:00",
          },
          {
            timeStart: "2024-03-10T14:30:00",
            timeEnd: "2024-03-10T15:30:00",
          },
        ],
        leagues: [],
        rating: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 },
      }}
      displayAbility={false}
    />,
    <RecProfile
      key={2}
      user={{
        _id: new ObjectId("1234567890ABCDEF12345678"),
        name: "Test User",
        description:
          "Lorem ipsum dolor sit amet... filler description. This description is long enough to take up three lines in XL fontsize, so the line clamping should take effect and replace everything beyond the 3rd line with an ellipsis",
        profilePicture:
          "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fnwscdn.com%2Fmedia%2Fcatalog%2Fproduct%2Fv%2Fe%2Fvermont-colt-is-a-tennis-racket-for-all-ages-to-enjoy_1.jpg&f=1&nofb=1&ipt=b2eea9ca10d0036a1d54b51800fde8f724ce5c9b87814ce135014d67cc074a17&ipo=images",
        email: "test_email+1234@example.com",
        sports: [
          { sport: Sport.Badminton, ability: AbilityLevel.Beginner },
          { sport: Sport.Tennis, ability: AbilityLevel.Intermediate },
          { sport: Sport.Squash, ability: AbilityLevel.Advanced },
        ],
        availability: [
          {
            timeStart: "2024-03-10T14:30:00",
            timeEnd: "2024-03-10T15:30:00",
          },
          {
            timeStart: "2024-03-10T14:30:00",
            timeEnd: "2024-03-10T15:30:00",
          },
          {
            timeStart: "2024-03-10T14:30:00",
            timeEnd: "2024-03-10T15:30:00",
          },
          {
            timeStart: "2024-03-10T14:30:00",
            timeEnd: "2024-03-10T15:30:00",
          },
        ],
        leagues: [],
        rating: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 },
      }}
      displayAbility={false}
    />,
    <RecProfile
      key={3}
      user={{
        _id: new ObjectId("1234567890ABCDEF12345678"),
        name: "Test User",
        description:
          "Lorem ipsum dolor sit amet... filler description. This description is long enough to take up three lines in XL fontsize, so the line clamping should take effect and replace everything beyond the 3rd line with an ellipsis",
        profilePicture:
          "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fnwscdn.com%2Fmedia%2Fcatalog%2Fproduct%2Fv%2Fe%2Fvermont-colt-is-a-tennis-racket-for-all-ages-to-enjoy_1.jpg&f=1&nofb=1&ipt=b2eea9ca10d0036a1d54b51800fde8f724ce5c9b87814ce135014d67cc074a17&ipo=images",
        email: "test_email+1234@example.com",
        sports: [
          { sport: Sport.Badminton, ability: AbilityLevel.Beginner },
          { sport: Sport.Tennis, ability: AbilityLevel.Intermediate },
          { sport: Sport.Squash, ability: AbilityLevel.Advanced },
        ],
        availability: [
          {
            timeStart: "2024-03-10T14:30:00",
            timeEnd: "2024-03-10T15:30:00",
          },
          {
            timeStart: "2024-03-10T14:30:00",
            timeEnd: "2024-03-10T15:30:00",
          },
          {
            timeStart: "2024-03-10T14:30:00",
            timeEnd: "2024-03-10T15:30:00",
          },
          {
            timeStart: "2024-03-10T14:30:00",
            timeEnd: "2024-03-10T15:30:00",
          },
        ],
        leagues: [],
        rating: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 },
      }}
      displayAbility={false}
    />,
    <RecProfile
      key={4}
      user={{
        _id: new ObjectId("1234567890ABCDEF12345678"),
        name: "Test User",
        description:
          "Lorem ipsum dolor sit amet... filler description. This description is long enough to take up three lines in XL fontsize, so the line clamping should take effect and replace everything beyond the 3rd line with an ellipsis",
        profilePicture:
          "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fnwscdn.com%2Fmedia%2Fcatalog%2Fproduct%2Fv%2Fe%2Fvermont-colt-is-a-tennis-racket-for-all-ages-to-enjoy_1.jpg&f=1&nofb=1&ipt=b2eea9ca10d0036a1d54b51800fde8f724ce5c9b87814ce135014d67cc074a17&ipo=images",
        email: "test_email+1234@example.com",
        sports: [
          { sport: Sport.Badminton, ability: AbilityLevel.Beginner },
          { sport: Sport.Tennis, ability: AbilityLevel.Intermediate },
          { sport: Sport.Squash, ability: AbilityLevel.Advanced },
        ],
        availability: [
          {
            timeStart: "2024-03-10T14:30:00",
            timeEnd: "2024-03-10T15:30:00",
          },
          {
            timeStart: "2024-03-10T14:30:00",
            timeEnd: "2024-03-10T15:30:00",
          },
          {
            timeStart: "2024-03-10T14:30:00",
            timeEnd: "2024-03-10T15:30:00",
          },
          {
            timeStart: "2024-03-10T14:30:00",
            timeEnd: "2024-03-10T15:30:00",
          },
        ],
        leagues: [],
        rating: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 },
      }}
      displayAbility={false}
    />,
  ];

  return (
    <Page>
      <Page.Header>
        <div className="flex flex-row max-w-fit w-fit">
          <Search onSubmit={console.log} />
        </div>
      </Page.Header>
      <Page.Body>
        <div
          ref={cardRef}
          className="overflow-auto h-full max-h-full w-full max-w-full flex flex-col"
          style={{ scrollSnapType: "y mandatory", scrollSnapStop: "always" }}
        >
          {cards}
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
      </Page.Footer>
    </Page>
  );
}
