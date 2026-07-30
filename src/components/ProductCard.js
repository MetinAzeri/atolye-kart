import React from "react";
import { ProductImage } from "./ProductImage.js";
import { StockNotifyForm } from "./StockNotifyForm.js";
import { categories } from "../data/categories.js";
import { useCart } from "../context/CartContext.js";

const { useState, useEffect } = React;

const stockLabels = {
  in_stock: "Stokta",
  low_stock: "Stokta Az",
  out_of_stock: "Tükendi",
};

export function ProductCard({ product }) {
  const [showStockForm, setShowStockForm] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCart();
  const category = categories.find((item) => item.id === product.categoryId);
  const isOutOfStock = product.stockStatus === "out_of_stock";
  const cardClassName = isOutOfStock ? "product-card product-card--out-of-stock" : "product-card";

  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 1500);
    return () => clearTimeout(timer);
  }, [justAdded]);

  function handleAddToCart() {
    addItem(product);
    setJustAdded(true);
  }

  return React.createElement(
    "div",
    { className: cardClassName },
    React.createElement(ProductImage, { images: product.images }),
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
    ),
    React.createElement(
      "div",
      { className: "card-actions" },
      React.createElement(
        "button",
        {
          type: "button",
          className: "card-button",
          onClick: handleAddToCart,
          disabled: isOutOfStock,
        },
        justAdded ? "Eklendi ✓" : "Sipariş Ver"
      ),
      isOutOfStock &&
        React.createElement(
          "button",
          {
            type: "button",
            className: "card-button card-button--secondary",
            onClick: () => setShowStockForm((current) => !current),
          },
          "Stok Bildirimi İste"
        )
    ),
    isOutOfStock &&
      React.createElement(
        "p",
        { className: "card-hint" },
        "Bu ürün stokta yok, stok bildirimi talep edebilirsiniz."
      ),
    showStockForm && React.createElement(StockNotifyForm, { product, onCancel: () => setShowStockForm(false) })
  );
}
