import React from "https://esm.sh/react@18";
import { ProductImage } from "./ProductImage.js";
import { OrderForm } from "./OrderForm.js";
import { StockNotifyForm } from "./StockNotifyForm.js";
import { categories } from "../data/categories.js";

const { useState } = React;

const stockLabels = {
  in_stock: "Stokta",
  low_stock: "Stokta Az",
  out_of_stock: "Tükendi",
};

export function ProductCard({ product }) {
  const [openForm, setOpenForm] = useState(null);
  const category = categories.find((item) => item.id === product.categoryId);
  const isOutOfStock = product.stockStatus === "out_of_stock";
  const cardClassName = isOutOfStock ? "product-card product-card--out-of-stock" : "product-card";

  function toggleForm(formName) {
    setOpenForm((current) => (current === formName ? null : formName));
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
          onClick: () => toggleForm("order"),
          disabled: isOutOfStock,
        },
        "Sipariş Ver"
      ),
      isOutOfStock &&
        React.createElement(
          "button",
          {
            type: "button",
            className: "card-button card-button--secondary",
            onClick: () => toggleForm("stock"),
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
    openForm === "order" && React.createElement(OrderForm, { product, onCancel: () => setOpenForm(null) }),
    openForm === "stock" && React.createElement(StockNotifyForm, { product, onCancel: () => setOpenForm(null) })
  );
}
