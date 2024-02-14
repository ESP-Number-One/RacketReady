import { Button } from "./components/button";
import { PageWithTitle } from "./components/page";

export function App() {
  return (
    <PageWithTitle
      currPage="home"
      disableAuth
      heading="Testing"
      setAPI={console.log}
    >
      <p>I am the child</p>
      <Button backgroundColor="red">Click me</Button>
    </PageWithTitle>
  );
}
