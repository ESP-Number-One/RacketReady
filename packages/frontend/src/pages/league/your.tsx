import { faArrowRight, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Icon } from "../../components/icon";
import { Page } from "../../components/page";
import { Header } from "../../components/page/header";
import { CardList } from "../../components/card_list";
import { API } from "../../state/auth";
import { Cards } from "../../utils/types_to_cards";
import { useViewNav } from "../../state/nav";
import { Link } from "../../components/link";

export function YourLeagues() {
  const api = useContext(API);
  const viewNavigate = useViewNav();

  return (
    <Page page="leagues">
      <Page.Header>
        Your Leagues
        <Header.Right>
          <Link href="/league/new" className="pr-2">
            <FontAwesomeIcon icon={faPlus} />
          </Link>
        </Header.Right>
      </Page.Header>
      <Page.Body className="overflow-y-scroll">
        <div className="h-fit items-end">
          <CardList
            nextPage={(pageNum: number) => {
              return api
                .league()
                .find({ pageStart: pageNum, query: { amIn: true } })
                .then((leagues) => {
                  return Cards.fromLeagues(leagues);
                });
            }}
            emptyListPlaceholder="You aren't a member of any leagues."
          />
          <div className="h-1 w-full bg-p-grey-900 my-2" />
          <div className=" flex flex-row place-content-end pr-2">
            <button
              className="flex flex-row align-middle h-full"
              onClick={() => {
                viewNavigate("/leagues/discover");
              }}
            >
              <p className="pr-2 font-title text-xl">Discover more</p>
              <Icon icon={faArrowRight} size="xl" />
            </button>
          </div>
        </div>
      </Page.Body>
    </Page>
  );
}
