import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./app.tsx";
import "../static/css/index.css";
import * as config from "@esp-group-one/config";

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Auth0Provider
        domain={config.auth.domain}
        clientId={config.auth.clientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: config.auth.apiIdentifier,
        }}
      >
        <App />
      </Auth0Provider>
    </React.StrictMode>,
  );
}
