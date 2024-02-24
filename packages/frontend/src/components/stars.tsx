import { faStar as faSolidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faRegStar } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function StarButton(props: {
  onClick: (rating: number) => void;
  currentRating: number;
  rating: number;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={props.disabled ?? false}
      onClick={() => {
        props.onClick(props.rating);
      }}
      type="button"
    >
      {props.currentRating >= props.rating ? (
        <FontAwesomeIcon icon={faSolidStar} size="2x" />
      ) : (
        <FontAwesomeIcon icon={faRegStar} size="2x" />
      )}
    </button>
  );
}

export function Stars(props: {
  rating: number;
  onRatingChange: (newRating: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-x-2">
      {[1, 2, 3, 4, 5].map((e) => (
        <StarButton
          currentRating={props.rating}
          disabled={props.disabled}
          key={e}
          onClick={props.onRatingChange}
          rating={e}
        />
      ))}
    </div>
  );
}
