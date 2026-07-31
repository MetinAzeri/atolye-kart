import React from "react";
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
  const { user, logout, loading } = useAuth();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  const accountControl = loading
    ? null
    : user
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
        React.createElement("span", { "aria-hidden": "true" }, "👤"),
        React.createElement("span", null, "Giriş Yap")
      );

  const accountBlock = React.createElement(
    "div",
    { className: "navbar-account" },
    accountControl,
    !user &&
      showLoginForm &&
      React.createElement(
        "div",
        { className: "navbar-login-dropdown" },
        React.createElement(LoginForm, {
          onSuccess: () => {
            setShowLoginForm(false);
            closeMenu();
          },
        })
      )
  );

  return React.createElement(
    "nav",
    { className: "navbar" },
    React.createElement(
      Link,
      { to: "/", onClick: closeMenu },
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
      accountBlock,
      React.createElement(
        Link,
        { to: "/sepet", className: "navbar-cart", onClick: closeMenu },
        "🛒",
        React.createElement("span", { className: "navbar-cart-count" }, totalCount)
      ),
      React.createElement(
        "button",
        {
          type: "button",
          className: "navbar-toggle",
          onClick: () => setMenuOpen((current) => !current),
          "aria-label": "Menüyü aç/kapat",
        },
        "☰"
      )
    ),
    menuOpen &&
      React.createElement(
        "div",
        { className: "navbar-mobile-menu" },
        React.createElement(
          "ul",
          { className: "navbar-mobile-links" },
          navItems.map((item) =>
            React.createElement(
              "li",
              { key: item.to },
              React.createElement(
                NavLink,
                { to: item.to, end: item.to === "/", className: navLinkClassName, onClick: closeMenu },
                item.label
              )
            )
          )
        ),
        accountBlock
      )
  );
}
