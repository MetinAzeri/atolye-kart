import React from "https://esm.sh/react@18";
import { ProductCard } from "./ProductCard.js";

export function ProductList({ products }) {
  return React.createElement(
    "div",
    { className: "products" },
    products.map((product) => React.createElement(ProductCard, { key: product.id, product }))
  );
}
