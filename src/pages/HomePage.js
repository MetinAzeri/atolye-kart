import React from "react";
import { Link } from "react-router-dom";
import { ProductList } from "../components/ProductList.js";
import { CeramicArtSection } from "../components/CeramicArtSection.js";
import { products } from "../data/products.js";

const featuredProducts = products.slice(0, 3);

export function HomePage() {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      "div",
      { className: "hero" },
      React.createElement(
        "div",
        { className: "hero-image-wrap" },
        React.createElement("img", { className: "hero-image", src: "assets/hero.jpg", alt: "" }),
        React.createElement(
          "div",
          { className: "hero-overlay" },
          React.createElement("h1", { className: "hero-title" }, "Kilhane Atölye"),
          React.createElement(
            "p",
            { className: "hero-tagline" },
            '"Toprağın sabırla şekle dönüştüğü yer."'
          )
        )
      ),
      React.createElement(Link, { to: "/urunler", className: "hero-cta" }, "Ürünleri Keşfet")
    ),
    React.createElement(
      "div",
      { className: "trust-strip" },
      React.createElement("span", null, "20+ El Yapımı Ürün"),
      React.createElement("span", null, "%100 El İşçiliği"),
      React.createElement("span", null, "Fırında Pişirilmiş")
    ),
    React.createElement(CeramicArtSection),
    React.createElement(
      "div",
      { className: "home-section" },
      React.createElement("h2", { className: "about-title" }, "En Çok Tercih Edilen Ürünler"),
      React.createElement(ProductList, { products: featuredProducts })
    ),
    React.createElement(
      "div",
      { className: "cta-band" },
      React.createElement("h2", { className: "cta-band-title" }, "Hayalindeki Parçayı Kendin Tasarla"),
      React.createElement(
        "p",
        { className: "cta-band-text" },
        "Ürün tipini, rengini, desenini ve üzerine yazılacak sözü sen seç — birebir sana özel bir seramik parçası oluştur."
      ),
      React.createElement(Link, { to: "/kendin-tasarla", className: "hero-cta" }, "Tasarlamaya Başla")
    )
  );
}
