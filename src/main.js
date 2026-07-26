import React from "https://esm.sh/react@18";
import { createRoot } from "https://esm.sh/react-dom@18/client";
import { products } from "./data/products.js";
import { ProductList } from "./components/ProductList.js";

function App() {
  return React.createElement(
    "div",
    { className: "page" },
    React.createElement(
      "div",
      { className: "header" },
      React.createElement("h1", { className: "workshop-name" }, "Kilhane Atölye"),
      React.createElement("p", { className: "tagline" }, '"Toprağın sabırla şekle dönüştüğü yer."')
    ),
    React.createElement(ProductList, { products })
  );
}

const root = createRoot(document.getElementById("root"));
root.render(React.createElement(App));
