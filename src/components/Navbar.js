import React from "https://esm.sh/react@18";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext.js";

const navItems = [
  { to: "/", label: "Ana Sayfa" },
  { to: "/urunler", label: "Ürünler" },
  { to: "/kendin-tasarla", label: "Kendin Tasarla" },
  { to: "/biz-kimiz", label: "Biz Kimiz" },
  { to: "/atolyeler", label: "Atölyeler" },
  { to: "/sepet", label: "Sepet" },
];

function navLinkClassName({ isActive }) {
  return isActive ? "nav-link nav-link--active" : "nav-link";
}

export function Navbar() {
  const { totalCount } = useCart();

  return React.createElement(
    "nav",
    { className: "navbar" },
    React.createElement(
      Link,
      { to: "/" },
      React.createElement("img", {
        className: "navbar-logo",
        src: "assets/logo.png",
        alt: "Kilhane Atölye",
      })
    ),
    React.createElement(
      "ul",
      { className: "navbar-links" },
      navItems.map((item) =>
        React.createElement(
          "li",
          { key: item.to },
          React.createElement(NavLink, { to: item.to, end: item.to === "/", className: navLinkClassName }, item.label)
        )
      )
    ),
    React.createElement(
      Link,
      { to: "/sepet", className: "navbar-cart" },
      "🛒",
      React.createElement("span", { className: "navbar-cart-count" }, totalCount)
    )
  );
}
