import { faStar as faSolidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faRegStar } from "@fortawesome/free-regular-svg-icons";
import {
  FontAwesomeIcon,
  type FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";

function StarButton(props: {
  onClick: (rating: number) => void;
  currentRating: number;
  rating: number;
  disabled?: boolean;
  size?: FontAwesomeIconProps["size"];
}) {
  return (
    <button
      disabled={props.disabled ?? false}
      onClick={() => {
        props.onClick(props.rating);
      }}
      type="button"
    >
      <FontAwesomeIcon
        icon={props.currentRating >= props.rating ? faSolidStar : faRegStar}
        size={props.size ?? "2x"}
      />
    </button>
  );
}

export function Stars(props: {
  rating: number;
  onRatingChange?: (newRating: number) => void;
  disabled?: boolean;
  size?: FontAwesomeIconProps["size"];
}) {
  return (
    <div className="space-x-2">
      {[1, 2, 3, 4, 5].map((e) => (
        <StarButton
          currentRating={props.rating}
          disabled={props.disabled}
          key={e}
          onClick={props.onRatingChange ?? (() => void 0)}
          rating={e}
          size={props.size}
        />
      ))}
    </div>
  );
}
