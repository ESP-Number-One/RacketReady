import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import * as config from "@esp-group-one/config";
import { App } from "./app";
import "../static/css/index.css";

window.__SHOW_ALT_AVAIL__ = false;
window.__CONFIRM_PROPOSAL__ = false;
window.__CONFIRM_CANCEL__ = false;

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <BrowserRouter>
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
          <Routes>
            <Route path="/*" element={<App />} />
          </Routes>
        </Auth0Provider>
      </BrowserRouter>
    </React.StrictMode>,
  );
}
