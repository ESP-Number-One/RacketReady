import { useState } from "react";
import { Stars } from "../components/stars";
import { ProfilePic } from "../components/profile_pic";

export function TestPage() {
  const [rating, setRating] = useState(2);
  return (
    <>
      <p className=" bg-progress-blue">First page!</p>
      <Stars rating={rating} onRatingChange={setRating} />
      <ProfilePic
        image={
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Cat_August_2010-4.jpg/1200px-Cat_August_2010-4.jpg"
        }
        sports={[
          {
            sportName: Sport.Tennis,
            selected: true,
            abilityLevel: "Beginner",
            onClick: () => {
              handleClick(0);
            },
          },
          {
            sportName: Sport.Badminton,
            selected: false,
            abilityLevel: "Intermediate",
            onClick: () => {
              handleClick(1);
            },
          },
          {
            sportName: Sport.Squash,
            selected: false,
            abilityLevel: "Advanced",
            onClick: () => {
              handleClick(2);
            },
          },
        ]}
      />
    </>
  );
}
