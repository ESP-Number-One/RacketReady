import { faPaperPlane, faBan } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "./components/icon";
import { Button } from "./components/button";
import { PageWithTitle } from "./components/page";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function App() {
  return (
    <PageWithTitle
      currPage="home"
      disableAuth
      heading="Testing"
      setAPI={console.log}
    >
      <p>I am the child</p>
      <Button backgroundColor="bg-green-500">Ready!</Button>
      <div className="grid grid-cols-2 gap-2 w-full">
        <Button
          backgroundColor="bg-green-500"
          icon={<Icon icon={faPaperPlane} />}
        >
          Send
        </Button>
        <Button backgroundColor="bg-red-500" icon={<Icon icon={faBan} />}>
          Cancel
        </Button>
      </div>
    </PageWithTitle>
  );
}
