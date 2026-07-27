import React from "https://esm.sh/react@18";
import { QrCode } from "../components/QrCode.js";

const REPO_URL = "https://github.com/MetinAzeri/atolye-kart";

export function HomePage() {
  return React.createElement(
    "div",
    { className: "header" },
    React.createElement(
      "div",
      { className: "header-text" },
      React.createElement("img", {
        className: "workshop-logo",
        src: "assets/logo.png",
        alt: "Kilhane Atölye",
      }),
      React.createElement("p", { className: "tagline" }, '"Toprağın sabırla şekle dönüştüğü yer."')
    ),
    React.createElement(QrCode, { value: REPO_URL })
  );
}
