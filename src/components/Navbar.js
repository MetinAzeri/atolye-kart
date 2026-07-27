import React from "https://esm.sh/react@18";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext.js";
import { useAuth } from "../context/AuthContext.js";
import { LoginForm } from "./LoginForm.js";

const { useState } = React;

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
  const { user, logout } = useAuth();
  const [showLoginForm, setShowLoginForm] = useState(false);

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
      "div",
      { className: "navbar-right" },
      React.createElement(
        "div",
        { className: "navbar-account" },
        user
          ? React.createElement(
              "div",
              { className: "navbar-user" },
              React.createElement("span", null, `Merhaba, ${user.username}`),
              React.createElement(
                "button",
                { type: "button", className: "navbar-logout-button", onClick: logout },
                "Çıkış Yap"
              )
            )
          : React.createElement(
              "button",
              {
                type: "button",
                className: "navbar-login-button",
                onClick: () => setShowLoginForm((current) => !current),
              },
              "👤 Giriş Yap"
            ),
        !user &&
          showLoginForm &&
          React.createElement(
            "div",
            { className: "navbar-login-dropdown" },
            React.createElement(LoginForm, { onSuccess: () => setShowLoginForm(false) })
          )
      ),
      React.createElement(
        Link,
        { to: "/sepet", className: "navbar-cart" },
        "🛒",
        React.createElement("span", { className: "navbar-cart-count" }, totalCount)
      )
    )
  );
}
