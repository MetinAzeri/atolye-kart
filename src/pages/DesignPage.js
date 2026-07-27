import React from "https://esm.sh/react@18";
import { ProductTypeIcon } from "../components/ProductTypeIcon.js";

const { useState } = React;

const productTypes = [
  { type: "plate", label: "Tabak" },
  { type: "cup", label: "Bardak" },
  { type: "tray", label: "Tepsi" },
  { type: "vase", label: "Vazo" },
];

export function DesignPage() {
  const [selectedType, setSelectedType] = useState(null);

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
          ? React.createElement(ProductTypeIcon, { type: selectedType, size: 160 })
          : React.createElement("p", { className: "design-preview-hint" }, "Bir ürün tipi seçin")
      )
    )
  );
}
