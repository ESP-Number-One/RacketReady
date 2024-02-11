/* eslint-disable -- wejfhbew*/
import { PageWithTitle } from "./components/page";
import { Form } from "./components/form";

function App(this: any) {
  handleSubmit: {
    console.log("Hello");
  }

  return (
    <div className="App">
      <PageWithTitle currPage="home" heading="Testing">
        <p>I am the child</p>
      </PageWithTitle>
      <Form onSubmit={this.handleSubmit()} />
    </div>
  );
}

export default App;
