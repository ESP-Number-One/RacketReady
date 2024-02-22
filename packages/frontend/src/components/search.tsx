import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useState } from "react";

interface SearchProps {
  onSubmit: (query: string) => void;
  showInput: boolean;
}

export const SearchButton = memo(function SearchButton({
  onSubmit,
  showInput,
}: SearchProps) {
  const [search, setSearch] = useState("");
  function onSubmitWrapper() {
    onSubmit(search);
  }

  return (
    <div className="display-flex flex-row">
      <input
        hidden={showInput}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
        onKeyUp={(e) => {
          if (e.key === "13") {
            onSubmitWrapper();
          }
        }}
        placeholder="Search"
      />
      <button
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
