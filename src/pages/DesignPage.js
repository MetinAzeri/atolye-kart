import React from "https://esm.sh/react@18";
import { ProductTypeIcon } from "../components/ProductTypeIcon.js";

const { useState } = React;

const productTypes = [
  { type: "plate", label: "Tabak" },
  { type: "cup", label: "Bardak" },
  { type: "tray", label: "Tepsi" },
  { type: "vase", label: "Vazo" },
];

const glazeColors = [
  { id: "toprak", label: "Toprak", value: "#b5551f" },
  { id: "zeytin", label: "Zeytin Yeşili", value: "#7d8c4a" },
  { id: "krem", label: "Krem", value: "#d8c3a5" },
  { id: "turkuaz", label: "Turkuaz", value: "#4a8b8c" },
  { id: "antrasit", label: "Antrasit", value: "#3d2b1f" },
];

export function DesignPage() {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  return React.createElement(
    "div",
    null,
    React.createElement("h1", { className: "about-title" }, "Kendin Tasarla"),
    React.createElement(
      "div",
      { className: "design-section" },
      React.createElement(
        "div",
        { className: "design-picker" },
        productTypes.map((item) =>
          React.createElement(
            "button",
            {
              key: item.type,
              type: "button",
              className:
                item.type === selectedType
                  ? "design-type-button design-type-button--selected"
                  : "design-type-button",
              onClick: () => setSelectedType(item.type),
            },
            React.createElement(ProductTypeIcon, { type: item.type, size: 48 }),
            React.createElement("span", null, item.label)
          )
        )
      ),
      React.createElement(
        "div",
        { className: "design-preview" },
        selectedType
          ? React.createElement(ProductTypeIcon, {
              type: selectedType,
              size: 160,
              style: selectedColor ? { color: selectedColor } : undefined,
            })
          : React.createElement("p", { className: "design-preview-hint" }, "Bir ürün tipi seçin")
      )
    ),
    React.createElement("p", { className: "design-color-label" }, "Renk"),
    React.createElement(
      "div",
      { className: "design-color-row" },
      glazeColors.map((color) =>
        React.createElement("button", {
          key: color.id,
          type: "button",
          title: color.label,
          "aria-label": color.label,
          className:
            color.value === selectedColor
              ? "design-color-swatch design-color-swatch--selected"
              : "design-color-swatch",
          style: { backgroundColor: color.value },
          onClick: () => setSelectedColor(color.value),
        })
      )
    )
  );
}
