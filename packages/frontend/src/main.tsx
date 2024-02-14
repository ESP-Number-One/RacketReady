import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import * as config from "@esp-group-one/config";
import { App } from "./app";
import "../static/css/index.css";

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Auth0Provider
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: config.auth.apiIdentifier,
        }}
        cacheLocation="localstorage"
        clientId={config.auth.clientId}
        domain={config.auth.domain}
        useRefreshTokens
      >
        <App />
      </Auth0Provider>
    </React.StrictMode>,
  );
}
