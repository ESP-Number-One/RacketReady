import { useState } from "react";
import type { APIClient } from "@esp-group-one/api-client";
import { PageWithTitle } from "./components/page.js";

function App() {
  const [api, setAPI] = useState<APIClient | undefined>();

  return (
    <PageWithTitle currPage="home" heading="Testing" setAPI={setAPI}>
      <p>I am the child</p>
      <button
        onClick={() => {
          console.log("Hi!");
          console.log(api);
          api
            ?.user()
            .find({})
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              console.log(`Error: ${err}`);
            });
        }}
        type="button"
      >
        Click me
      </button>
    </PageWithTitle>
  );
}

export default App;
