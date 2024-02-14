import { PageWithTitle } from "./components/page.js";

export function App() {
  return (
    <PageWithTitle
      currPage="home"
      disableAuth
      heading="Testing"
      setAPI={console.log}
    >
      <p>I am the child</p>
    </PageWithTitle>
  );
}
