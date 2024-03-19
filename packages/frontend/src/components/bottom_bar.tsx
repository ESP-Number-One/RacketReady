import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faMagnifyingGlass,
  faTrophy,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { Link } from "./link.tsx";

export function BottomBar(props: {
  activePage?: "home" | "search" | "leagues" | "profile";
}) {
  return (
    <div className="grid bg-white grid-cols-4 pb-3 pt-3 bottom-0 left-0 w-full border-t-p-grey-900 border-t-4">
      <Link
        className={twMerge(
          props.activePage === "home" ? "text-p-blue font-bold" : "",
          "flex justify-center w-full",
        )}
        href="/"
      >
        <FontAwesomeIcon icon={faHouse} className="text-center" size="2x" />
      </Link>
      <Link
        className={twMerge(
          props.activePage === "search" ? "text-p-blue font-bold" : "",
          "flex justify-center w-full",
        )}
        href="/search"
      >
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="text-center"
          size="2x"
        />
      </Link>
      <Link
        className={twMerge(
          props.activePage === "leagues" ? "text-p-blue font-bold" : "",
          "flex justify-center w-full",
        )}
        href="/leagues"
      >
        <FontAwesomeIcon icon={faTrophy} className="text-center" size="2x" />
      </Link>
      <Link
        className={twMerge(
          props.activePage === "profile" ? "text-p-blue font-bold" : "",
          "flex justify-center w-full",
        )}
        href="/me"
      >
        <FontAwesomeIcon icon={faUser} className="text-center" size="2x" />
      </Link>
    </div>
  );
}
