import { faArrowRight, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useContext } from "react";
import { Button } from "../components/button";
import { Icon } from "../components/icon";
import { Page } from "../components/page";
import { Header } from "../components/page/header";
import { CardList } from "../components/card_list";
import { API } from "../state/auth";
import { Cards } from "../utils/types_to_cards";
import { BottomBar } from "../components/bottom_bar";
import { useViewNav } from "../state/nav";

export function YourLeagues() {
  const api = useContext(API);
  const viewNavigate = useViewNav();

  return (
    <Page>
      <Page.Header>
        Your Leagues
        <Header.Right>
          <Button>
            <Icon icon={faPlus} />
          </Button>
        </Header.Right>
      </Page.Header>
      <Page.Body>
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
          <button
            className="flex flex-row"
            onClick={() => {
              viewNavigate("/leagues/discover");
            }}
          >
            Discover more
            <Icon icon={faArrowRight} size="lg" />
          </button>
        </div>
      </Page.Body>
      <Page.Footer>
        <BottomBar activePage={"leagues"} />
      </Page.Footer>
    </Page>
  );
}
