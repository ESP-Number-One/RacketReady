import * as React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./app.tsx";
import "../static/css/index.css";

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
