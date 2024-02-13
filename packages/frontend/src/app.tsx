/* eslint-disable -- wejfhbew*/
import { PageWithTitle } from "./components/page";
import { Form } from "./components/form";

function App() {
  const handleSubmit = async () => {
    console.log("Hello");
  };

  return (
    <div className="App">
      <PageWithTitle currPage="home" heading="Testing">
        <p>I am the child</p>
        <Form onSubmit={handleSubmit}>
          <label className="paddingBottom-3px">Enter your name:</label>
          <br />
          <input
            className="boarder-2px-solid-black boarderRadius-4px paddingLeft-8px"
            name="Name"
            type="text"
            boarder-black
            value="Enter your name"
            placeholder="Enter your username"
          />
        </Form>
      </PageWithTitle>
    </div>
  );
}

export default App;
