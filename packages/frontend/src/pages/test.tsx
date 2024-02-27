import { useState } from "react";
import { Stars } from "../components/stars";
import { RecProfile } from "../components/rec_profile";

const handleClick = (clickedIndex: number) => {
  console.log(clickedIndex);
};

export function TestPage() {
  const [rating, setRating] = useState(2);
  return (
    <>
      <p className=" bg-progress-blue">First page!</p>
      <Stars rating={rating} onRatingChange={setRating} />
      <RecProfile
        image={
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Cat_August_2010-4.jpg/1200px-Cat_August_2010-4.jpg"
        }
        sports={[
          { sport: Sport.Tennis, ability: "Beginner" },
          { sport: Sport.Badminton, ability: "Intermediate" },
        ]}
        selected={Sport.Tennis}
        onClick={() => {
          handleClick;
        }}
        displayAbility={false}
      />
    </>
  );
}
