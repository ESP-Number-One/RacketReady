import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useState } from "react";

interface SearchProps {
  onSubmit: (query: string) => void;
  hidden?: boolean;
}

export const Search = memo(function Search({ onSubmit, hidden }: SearchProps) {
  const [search, setSearch] = useState("");
  function onSubmitWrapper() {
    if (search === "") return;
    onSubmit(search);
  }

  return (
    <div className="display-flex flex-row w-full h-full">
      <form>
        <input
          autoFocus
          className="font-body m-2 ml-1 p-1 w-fit bg-gray-100 rounded-lg h-fit text-xl"
          data-testid="search-input"
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
          required
          type="text"
        />
        <button
          className="m-2 ml-1 bg-gray-200 p-2 rounded-lg duration-100 hover:bg-gray-400 active:bg-gray-400 focus:ring focus:ring-gray-600"
          data-testid="search-button"
          onClick={() => {
            onSubmitWrapper();
          }}
          type="button"
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
      </form>
    </div>
  );
});
