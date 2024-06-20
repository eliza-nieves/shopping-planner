import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App.tsx";
import GlobalStyle from "./styles.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GlobalStyle />
    <App />
  </React.StrictMode>
);
