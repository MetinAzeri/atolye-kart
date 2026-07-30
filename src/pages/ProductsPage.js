import React from "react";
import { products } from "../data/products.js";
import { ProductList } from "../components/ProductList.js";

export function ProductsPage() {
  return React.createElement(ProductList, { products });
}
