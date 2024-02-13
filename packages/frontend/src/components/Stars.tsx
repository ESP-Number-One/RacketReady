import Star from "../star.svg";
import { faStar as faSolidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faRegStar } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
function StarButton(props: {
  onClick: (rating: number) => void;
  currentRating: number;
  rating: number;
}) {
  return (
    <button onClick={() => props.onClick(props.rating)}>
      {props.currentRating >= props.rating ? (
        <FontAwesomeIcon icon={faSolidStar} size="2x" />
      ) : (
        <FontAwesomeIcon icon={faRegStar} size="2x" />
      )}
      {/*<img*/}
      {/*  src={Star}*/}
      {/*  className="w-10 h-10 border-2 border-squash-yellow"*/}
      {/*  style={{*/}
      {/*    backgroundColor:*/}
      {/*      props.currentRating >= props.rating ? "yellow" : undefined,*/}
      {/*  }}*/}
      {/*  alt={"star"}*/}
      {/*/>*/}
    </button>
  );
}

export default function Stars(props: {
  rating: number;
  onRatingChange: (newRating: number) => void;
}) {
  return (
    <div className="space-x-2">
      {[1, 2, 3, 4, 5].map((e) => (
        <StarButton
          onClick={props.onRatingChange}
          currentRating={props.rating}
          rating={e}
          key={e}
        />
      ))}
    </div>
  );
}
