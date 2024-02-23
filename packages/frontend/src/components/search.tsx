import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useState } from "react";

interface SearchProps {
  onSubmit: (query: string) => void;
  hidden?: boolean;
}

export const SearchButton = memo(function SearchButton({
  onSubmit,
  hidden,
}: SearchProps) {
  const [search, setSearch] = useState("");
  function onSubmitWrapper() {
    onSubmit(search);
  }

  return (
    <div className="display-flex flex-row w-full h-full">
      <input
        className="font-body m-2 ml-1 p-1 w-fit bg-gray-100 rounded-lg h-fit text-xl"
        hidden={hidden}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            onSubmitWrapper();
          }
        }}
        placeholder="Search"
      />
      <button
        className="m-2 ml-1 bg-gray-200 p-2 rounded-lg duration-100 hover:bg-gray-400 active:bg-gray-400 focus:ring focus:ring-gray-600"
        onClick={() => {
          onSubmitWrapper();
        }}
        type="button"
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </button>
    </div>
  );
});
