import "../static/css/fonts.css";
import "../static/css/colours.css";
import { PageWithTitle } from "./components/page";

function App() {
  return (
    <PageWithTitle currPage="home" heading="Testing">
      <p>I am the child</p>
    </PageWithTitle>
  );
}

export default App;
