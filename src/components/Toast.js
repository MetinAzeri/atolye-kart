import React from "https://esm.sh/react@18";
import { useCart } from "../context/CartContext.js";

export function Toast() {
  const { toast } = useCart();

  if (!toast) return null;

  return React.createElement("div", { className: "toast" }, "✓ ", toast);
}
