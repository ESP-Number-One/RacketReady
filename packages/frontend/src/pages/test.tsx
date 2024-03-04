import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Stars } from "../components/stars";
import { Page } from "../components/page";
import { Header } from "../components/page/header";
import { useViewNav } from "../state/nav";

export function TestPage() {
  const [rating, setRating] = useState(2);
  const viewNavigate = useViewNav();

  return (
    <Page>
      <Page.Header>
        <Header.Back />
        Whatever goes in here, stays in here.
        <Header.Right>
          <FontAwesomeIcon icon={faPlus} />
        </Header.Right>
      </Page.Header>
      <Page.Body style={{ viewTransitionName: "body-content" }}>
        <p className=" bg-progress-blue">First page!</p>
        <Stars rating={rating} onRatingChange={setRating} />
      </Page.Body>
      <Page.Footer>
        <button
          onClick={() => {
            viewNavigate("/");
          }}
        >
          First Test page
        </button>
        <button
          onClick={() => {
            viewNavigate("/another");
          }}
        >
          Another page.
        </button>
      </Page.Footer>
    </Page>
  );
}
