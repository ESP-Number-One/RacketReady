import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { memo, useState } from "react";
import { Icon } from "./icon";

interface SearchProps {
  onSubmit: (query: string) => void;
  hidden?: boolean;
}

export const Search = memo(function Search({ onSubmit, hidden }: SearchProps) {
  const [search, setSearch] = useState("");
  const onSubmitWrapper = () => {
    if (search === "") return;
    onSubmit(search);
  };

  return (
    <div className=" w-fit max-w-fit bg-p-grey-100 rounded-xl align-middle">
      <form
        className="flex flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmitWrapper();
        }}
      >
        <button
          className="rounded-lg p1 ml-2 mr-1 self-center justify-center align-middle"
          data-testid="search-button"
          type="submit"
        >
          <Icon icon={faMagnifyingGlass} color="#fff" size="sm" />
        </button>
        <input
          className="font-title placeholder:font-black max-w-full w-full font-black p-1 mr-2 ml-1 bg-p-grey-100 rounded-lg placeholder:text-2xl text-2xl placeholder:text-white text-white"
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
