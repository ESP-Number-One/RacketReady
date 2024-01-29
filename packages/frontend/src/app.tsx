import reactLogo from "../static/img/react.svg";
import viteLogo from "../static/img/vite.svg";
import "../static/css/app.css";

function App() {
  return (
    <>
      <div>
        <a href="https://vitejs.dev" rel="noopener" target="_blank">
          <img alt="Vite logo" className="logo" src={viteLogo} />
        </a>
        <a href="https://react.dev" rel="noopener" target="_blank">
          <img alt="React logo" className="logo react" src={reactLogo} />
        </a>
      </div>
      <h1>Vite + React</h1>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
