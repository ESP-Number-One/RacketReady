import { useState } from "react";
import { Stars } from "../components/stars";

export function TestPage() {
  const [rating, setRating] = useState(2);
  return (
    <>
      <p className=" bg-progress-blue">First page!</p>
      <Stars rating={rating} onRatingChange={setRating} />
    </>
  );
}
