import { useContext, useEffect, useState } from "react";
import { type User } from "@esp-group-one/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { API } from "../state/auth";
import { Page } from "../components/page";
import { Header } from "../components/page/header";
import { useViewNav } from "../state/nav";

export function AnotherTestPage() {
  const api = useContext(API);
  const [user, setUser] = useState(undefined as undefined | User);
  const viewNavigate = useViewNav();

  useEffect(() => {
    api.user().me().then(setUser).catch(console.warn);
  }, [api]);

  return (
    <Page>
      <Page.Header>
        <Header.Back />
        Whatever goes in here, stays in here.
        <Header.Right>
          <FontAwesomeIcon icon={faPlus} />
        </Header.Right>
      </Page.Header>
      <Page.Body>{user !== undefined ? <p>aaa</p> : <p>Loading</p>}</Page.Body>
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
