import {
  faArrowRight,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useState } from "react";
import { GenericCardList } from "./generic_card_list";

interface searchProps {
  onSubmit: (query: string) => void;
}

export const SearchCompetitor = memo(function SearchCompetitor({
  onSubmit,
}: searchProps) {
  const [hideSearch, setHideSearch] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  function onSubmitWrapper() {
    onSubmit(searchQuery);
  }
  return (
    <div className="display-flex">
      <button
        onClick={() => {
          setHideSearch(!hideSearch);
        }}
        type="button"
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </button>
      <div hidden={hideSearch}>
        <input
          inputMode="text"
          name="search"
          onChange={(i) => {
            setSearchQuery(i.target.value);
          }}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              onSubmitWrapper();
            }
          }}
          onSubmit={() => {
            onSubmitWrapper();
          }}
          placeholder="Search for competitors..."
          required
          type="text"
        />
        <button
          onClick={() => {
            onSubmitWrapper();
          }}
          onSubmit={() => {
            onSubmitWrapper();
          }}
          type="submit"
          value="Search"
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
      <GenericCardList cardSubjects={[]}></GenericCardList>
    </div>
  );
});
