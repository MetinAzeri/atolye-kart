import React from "https://esm.sh/react@18";
import { ProductImage } from "./ProductImage.js";
import { categories } from "../data/categories.js";

const stockLabels = {
  in_stock: "Stokta",
  low_stock: "Az Stokta",
  out_of_stock: "Tükendi",
};

export function ProductCard({ product }) {
  const category = categories.find((item) => item.id === product.categoryId);
  const cardClassName =
    product.stockStatus === "out_of_stock" ? "product-card product-card--out-of-stock" : "product-card";

  return React.createElement(
    "div",
    { className: cardClassName },
    React.createElement(ProductImage, { image: product.image }),
    category &&
      React.createElement(
        "span",
        { className: "product-category", style: { backgroundColor: category.color } },
        category.label
      ),
    React.createElement("h2", { className: "product-name" }, product.name),
    React.createElement("p", { className: "product-price" }, `${product.price}₺`),
    React.createElement("p", { className: "product-description" }, product.description),
    React.createElement(
      "span",
      { className: `product-stock product-stock--${product.stockStatus.replace(/_/g, "-")}` },
      stockLabels[product.stockStatus]
    )
  );
}
