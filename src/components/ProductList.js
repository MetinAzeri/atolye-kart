import React from "react";
import { ProductCard } from "./ProductCard.js";

export function ProductList({ products }) {
  return React.createElement(
    "div",
    { className: "products" },
    products.map((product) => React.createElement(ProductCard, { key: product.id, product }))
  );
}
