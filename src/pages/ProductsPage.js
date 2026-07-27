import React from "https://esm.sh/react@18";
import { products } from "../data/products.js";
import { ProductList } from "../components/ProductList.js";

export function ProductsPage() {
  return React.createElement(ProductList, { products });
}
