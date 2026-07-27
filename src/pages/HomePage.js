import React from "https://esm.sh/react@18";
import { Link } from "react-router-dom";
import { QrCode } from "../components/QrCode.js";
import { ProductList } from "../components/ProductList.js";
import { products } from "../data/products.js";

const REPO_URL = "https://github.com/MetinAzeri/atolye-kart";
const featuredProducts = products.slice(0, 3);

const ABOUT_TEASER =
  "Her şey bir avuç toprak ve sabırla başladı. Kilhane Atölye, elleriyle üretmenin değerine inanan birkaç ustanın bir araya gelmesiyle doğdu.";

export function HomePage() {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
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
    ),
    React.createElement(
      "div",
      { className: "hero" },
      React.createElement("img", { className: "hero-image", src: "assets/hero.jpg", alt: "" }),
      React.createElement(Link, { to: "/urunler", className: "hero-cta" }, "Ürünleri Keşfet")
    ),
    React.createElement(
      "div",
      { className: "home-section" },
      React.createElement("h2", { className: "about-title" }, "Öne Çıkanlar"),
      React.createElement(ProductList, { products: featuredProducts })
    ),
    React.createElement(
      "div",
      { className: "home-section home-teaser" },
      React.createElement("p", { className: "about-text" }, ABOUT_TEASER),
      React.createElement(Link, { to: "/biz-kimiz", className: "home-teaser-link" }, "Devamını Oku →")
    )
  );
}
