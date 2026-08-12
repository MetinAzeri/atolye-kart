import React from "react";
import { products } from "../data/products.js";
import { ProductList } from "../components/ProductList.js";
import { trackEvent } from "../lib/events.js";

const { useEffect } = React;

export function ProductsPage() {
  useEffect(() => {
    products.forEach((product) => trackEvent("urun_goruntulendi", product.id));
  }, []);
  return React.createElement(ProductList, { products });
}
