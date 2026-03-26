import React from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import { PortalApp } from "features/portal/PortalApp";

ReactDOM.render(
  <React.StrictMode>
    <PortalApp />
  </React.StrictMode>,
  document.getElementById("root"),
);
