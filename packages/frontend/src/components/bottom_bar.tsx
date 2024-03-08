import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faMagnifyingGlass,
  faPerson,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import { useViewNav } from "../state/nav.ts";

export function BottomBar(props: {
  activePage: "home" | "search" | "leagues" | "profile";
}) {
  const viewNavigate = useViewNav();

  return (
    <div className="flex justify-between grid-cols-4 mb-3 pt-3 bottom-0 left-0 fixed w-full border-t-p-grey-900 border-t-4">
      <button
        className={`${
          props.activePage === "home" ? "bg-p-blue" : ""
        } flex justify-center w-full`}
        onClick={() => {
          viewNavigate("/");
        }}
      >
        <FontAwesomeIcon icon={faHouse} className="text-center" size="2x" />
      </button>
      <button
        onClick={() => {
          viewNavigate("/search");
        }}
        className={`${
          props.activePage === "search" ? "bg-p-blue" : ""
        } flex justify-center w-full`}
      >
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="text-center"
          size="2x"
        />
      </button>
      <button
        onClick={() => {
          viewNavigate("/leagues");
        }}
        className={`${
          props.activePage === "leagues" ? "bg-p-blue" : ""
        } flex justify-center w-full`}
      >
        <FontAwesomeIcon icon={faTrophy} className="text-center" size="2x" />
      </button>
      <button
        onClick={() => {
          viewNavigate("/profile");
        }}
        className={`${
          props.activePage === "profile" ? "bg-p-blue" : ""
        } flex justify-center w-full`}
      >
        <FontAwesomeIcon icon={faPerson} className="text-center" size="2x" />
      </button>
    </div>
  );
}
