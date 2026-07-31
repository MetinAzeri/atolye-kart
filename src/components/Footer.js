import React from "react";
import { Link } from "react-router-dom";
import { QrCode } from "./QrCode.js";

const SITE_URL = "https://metinazeri.github.io/atolye-kart/#/";

export function Footer() {
  return React.createElement(
    "footer",
    { className: "footer" },
    React.createElement(QrCode, { value: SITE_URL, label: "Mobilden Keşfedin" }),
    React.createElement(
      "div",
      { className: "footer-meta" },
      React.createElement("p", { className: "footer-copyright" }, "© 2026 Kilhane Atölye · El yapımı seramik"),
      React.createElement("p", { className: "footer-contact" }, "İletişim: info@kilhaneatolye.com"),
      React.createElement(
        Link,
        { to: "/privacy-policy", className: "footer-privacy-link" },
        "Gizlilik Politikası"
      )
    )
  );
}
