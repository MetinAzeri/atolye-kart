import React from "https://esm.sh/react@18";
import { createRoot } from "https://esm.sh/react-dom@18/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar.js";
import { HomePage } from "./pages/HomePage.js";
import { ProductsPage } from "./pages/ProductsPage.js";
import { AboutPage } from "./pages/AboutPage.js";
import { CartPage } from "./pages/CartPage.js";

function App() {
  return React.createElement(
    HashRouter,
    null,
    React.createElement(Navbar),
    React.createElement(
      "div",
      { className: "page" },
      React.createElement(
        Routes,
        null,
        React.createElement(Route, { path: "/", element: React.createElement(HomePage) }),
        React.createElement(Route, { path: "/urunler", element: React.createElement(ProductsPage) }),
        React.createElement(Route, { path: "/biz-kimiz", element: React.createElement(AboutPage) }),
        React.createElement(Route, { path: "/sepet", element: React.createElement(CartPage) })
      )
    )
  );
}

const root = createRoot(document.getElementById("root"));
root.render(React.createElement(App));
