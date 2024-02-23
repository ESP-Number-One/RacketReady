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
    <div className="display-flex flex-row">
      <input
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
