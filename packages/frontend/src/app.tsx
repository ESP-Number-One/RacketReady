import { PageWithTitle } from "./components/page";

export function App() {
  return (
    <PageWithTitle currPage="home" heading="Testing">
      <p>I am the child</p>
    </PageWithTitle>
  );
}
