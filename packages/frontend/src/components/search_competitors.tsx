import {
  faArrowRight,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

function submitSearch(query: string) {
  const data = `{
    query: {
      name: ${query},
    },
    sort: "",
    pageStart: "0",
    pageSize: "20",
  }`;
  // Request a list of censored users form backend
  let req = new Request("http://localhost:3000/user/find", {
    method: "POST",
    body: data,
  });
  fetch(req)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP Error occurred, status ${response.status}`);
      }
      return response.blob();
    })
    .then((responseBlob) => {
      console.log(responseBlob);
    })
    .catch((err) => {
      console.log(`Error occurred ${err}`);
    });
}

interface SearchBarProps {
  id: number;
}

export function SearchCompetitor({ id }: SearchBarProps) {
  const [hideSearch, setHideSearch] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const input = (
    <input
      id={`searchbar-${id}`}
      placeholder="Search for competitors..."
      onInput={(i) => {
        setSearchQuery(i.target.value);
      }}
    />
  );
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
        {input}
        <button
          type="button"
          onClick={() => {
            submitSearch(searchQuery);
          }}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    </div>
  );
}
