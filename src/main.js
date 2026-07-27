import React from "https://esm.sh/react@18";
import { createRoot } from "https://esm.sh/react-dom@18/client";
import { products } from "./data/products.js";
import { ProductList } from "./components/ProductList.js";
import { QrCode } from "./components/QrCode.js";

const REPO_URL = "https://github.com/MetinAzeri/atolye-kart";

function App() {
  return React.createElement(
    "div",
    { className: "page" },
    React.createElement(
      "div",
      { className: "header" },
      React.createElement(
        "div",
        { className: "header-text" },
        React.createElement("h1", { className: "workshop-name" }, "Kilhane Atölye"),
        React.createElement("p", { className: "tagline" }, '"Toprağın sabırla şekle dönüştüğü yer."')
      ),
      React.createElement(QrCode, { value: REPO_URL })
    ),
    React.createElement(ProductList, { products })
  );
}

const root = createRoot(document.getElementById("root"));
root.render(React.createElement(App));
