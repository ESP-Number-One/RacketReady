import { useState } from "react";
import { PageWithTitle } from "./components/page.js";
import { APIClient } from "@esp-group-one/api-client";
import { APIClientInit } from "./components/auth.js";

function App() {
  const [api, setAPI] = useState<APIClient | undefined>();

  return (
    <PageWithTitle currPage="home" heading="Testing">
      <p>I am the child</p>
      <APIClientInit setAPI={setAPI} />
      <button
        onClick={() => {
          console.log("Hi!");
          console.log(api);
          api
            ?.user()
            .find({})
            .then((res) => console.log(res))
            .catch((err) => console.log(`Error: ${err}`));
        }}
      >
        Click me
      </button>
    </PageWithTitle>
  );
}

export default App;
