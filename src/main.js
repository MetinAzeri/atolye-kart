import React from "https://esm.sh/react@18";
import { createRoot } from "https://esm.sh/react-dom@18/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext.js";
import { AuthProvider } from "./context/AuthContext.js";
import { Navbar } from "./components/Navbar.js";
import { Toast } from "./components/Toast.js";
import { Footer } from "./components/Footer.js";
import { HomePage } from "./pages/HomePage.js";
import { ProductsPage } from "./pages/ProductsPage.js";
import { AboutPage } from "./pages/AboutPage.js";
import { CartPage } from "./pages/CartPage.js";
import { DesignPage } from "./pages/DesignPage.js";
import { WorkshopsPage } from "./pages/WorkshopsPage.js";

function App() {
  return React.createElement(
    AuthProvider,
    null,
    React.createElement(
      CartProvider,
      null,
      React.createElement(
        HashRouter,
        null,
        React.createElement(Navbar),
        React.createElement(Toast),
        React.createElement(
          "div",
          { className: "page" },
          React.createElement(
            Routes,
            null,
            React.createElement(Route, { path: "/", element: React.createElement(HomePage) }),
            React.createElement(Route, { path: "/urunler", element: React.createElement(ProductsPage) }),
            React.createElement(Route, { path: "/biz-kimiz", element: React.createElement(AboutPage) }),
            React.createElement(Route, { path: "/sepet", element: React.createElement(CartPage) }),
            React.createElement(Route, { path: "/kendin-tasarla", element: React.createElement(DesignPage) }),
            React.createElement(Route, { path: "/atolyeler", element: React.createElement(WorkshopsPage) })
          )
        ),
        React.createElement(Footer)
      )
    )
  );
}

const root = createRoot(document.getElementById("root"));
root.render(React.createElement(App));
