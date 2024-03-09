import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { memo, useState } from "react";
import { Icon } from "./icon";

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
    <div className="display-inline w-fit h-fit bg-p-grey-200 rounded-lg align-middle">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmitWrapper();
        }}
      >
        <button
          className="rounded-lg p1 ml-2 mb-1 mr-1 self-center justify-center align-middle"
          data-testid="search-button"
          type="submit"
        >
          <Icon icon={faMagnifyingGlass} color="#fff" size="lg" />
        </button>
        <input
          className="font-body p-1 mr-2 mt-2 mb-2 ml-1 bg-p-grey-200 rounded-lg text-xl text-white placeholder:text-white focus:"
          data-testid="search-input"
          hidden={hidden}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          placeholder="Search people!"
          required
          type="text"
        />
      </form>
    </div>
  );
});
