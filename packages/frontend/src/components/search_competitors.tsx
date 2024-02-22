import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";
import { CardList } from "./cards/card_list";

type SearchableObject = "user" | "league" | "match";

interface SearchProps {
  searchBtnPressedWrapper: (obj: SearchableObject) => void;
  searchType: SearchableObject;
}

export const searchBtnPressed = (obj: SearchableObject) => {
  let result = (
    <CardList
      clientType="user"
      queryOptions={{ query: {}, sort: "", pageStart: 0, pageSize: 0 }}
    />
  );
  switch (obj) {
    case "user": {
      // get page 0 of users and convert to cardDetail
      result = (
        <CardList
          clientType="user"
          queryOptions={{
            query: { name: "" },
            sort: "",
            pageStart: 0,
            pageSize: 20,
          }}
        />
      );
      break;
    }
    case "league": {
      // get page 0 of leagues and convert to cardDetail
      result = (
        <CardList
          clientType="league"
          queryOptions={{
            query: { name: "" },
            sort: "",
            pageStart: 0,
            pageSize: 20,
          }}
        />
      );
      break;
    }
    case "match": {
      // get page 0 of matches and convert to cardDetail
      result = (
        <CardList
          clientType="match"
          queryOptions={{
            query: { owner: "" },
            sort: "",
            pageStart: 0,
            pageSize: 20,
          }}
        />
      );
      break;
    }
  }
  return result;
};

export const SearchButton = memo(function SearchButton({
  searchBtnPressedWrapper,
  searchType,
}: SearchProps) {
  return (
    <div className="display-flex">
      <button
        onClick={() => {
          searchBtnPressedWrapper(searchType);
        }}
        type="button"
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </button>
    </div>
  );
});
