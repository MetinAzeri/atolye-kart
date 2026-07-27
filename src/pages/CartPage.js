import React from "https://esm.sh/react@18";
import { products } from "../data/products.js";
import { useCart } from "../context/CartContext.js";
import { CheckoutForm } from "../components/CheckoutForm.js";
import { CeramicPreview } from "../components/CeramicPreview.js";

const { useState } = React;

export function CartPage() {
  const { items, incrementItem, decrementItem, totalPrice } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  if (items.length === 0 && !showCheckout) {
    return React.createElement("p", { className: "tagline" }, "Sepetiniz boş.");
  }

  return React.createElement(
    "div",
    { className: "cart" },
    items.length > 0 &&
    React.createElement(
      "div",
      { className: "cart-items" },
      items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return React.createElement(
          "div",
          { key: item.productId, className: "cart-item" },
          item.custom
            ? React.createElement(
                "div",
                { className: "cart-item-image cart-item-image--custom" },
                React.createElement(CeramicPreview, {
                  type: item.custom.type,
                  color: item.custom.color,
                  pattern: item.custom.pattern,
                  text: item.custom.text,
                  size: 56,
                })
              )
            : React.createElement("img", {
                className: "cart-item-image",
                src: product ? product.images[0] : "",
                alt: "",
              }),
          React.createElement(
            "div",
            { className: "cart-item-info" },
            React.createElement("p", { className: "cart-item-name" }, item.name),
            React.createElement(
              "div",
              { className: "cart-qty-controls" },
              React.createElement(
                "button",
                { type: "button", className: "cart-qty-button", onClick: () => decrementItem(item.productId) },
                "−"
              ),
              React.createElement("span", { className: "cart-qty-value" }, item.quantity),
              React.createElement(
                "button",
                { type: "button", className: "cart-qty-button", onClick: () => incrementItem(item.productId) },
                "+"
              )
            )
          ),
          React.createElement("p", { className: "cart-item-total" }, `${item.price * item.quantity}₺`)
        );
      })
    ),
    items.length > 0 &&
      React.createElement(
        "div",
        { className: "cart-total-row" },
        React.createElement("span", null, "Genel Toplam"),
        React.createElement("span", { className: "cart-total-amount" }, `${totalPrice}₺`)
      ),
    items.length > 0 &&
      !showCheckout &&
      React.createElement(
        "button",
        { type: "button", className: "card-button", onClick: () => setShowCheckout(true) },
        "Siparişi Tamamla"
      ),
    showCheckout && React.createElement(CheckoutForm, { onCancel: () => setShowCheckout(false) })
  );
}
