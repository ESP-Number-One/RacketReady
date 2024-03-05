import { Sport } from "@esp-group-one/types";
import { RecProfile } from "./components/rec_profile";

export function App() {
  function handleClick() {
    console.log();
  }

  return (
    <div>
      <h1>Hello World!</h1>
      <RecProfile
        sports={[
          {
            sport: Sport.Tennis,
            ability: "Beginner",
          },
          {
            sport: Sport.Badminton,
            ability: "Intermediate",
          },
        ]}
        selected={Sport.Tennis}
        image="https://upload.wikimedia.org/wikipedia/commons/9/94/2013_Australian_Open_-_Guillaume_Rufin.jpg"
        displayAbility={true}
        onClick={() => {
          handleClick();
        }}
      />
    </div>
  );
}
