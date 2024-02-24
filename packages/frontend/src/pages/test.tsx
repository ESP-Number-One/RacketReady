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
        sports={[
          {
            sportName: Sport.Tennis,
            selected: true,
            abilityLevel: "Beginner",
          },
          {
            sportName: Sport.Badminton,
            selected: false,
            abilityLevel: "Beginner",
          },
        ]}
      />
      </PageWithTitle>
    </>
  );
}
