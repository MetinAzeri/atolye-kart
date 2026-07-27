import React from "https://esm.sh/react@18";
import { CeramicPreview } from "../components/CeramicPreview.js";
import { useCart } from "../context/CartContext.js";

const { useState } = React;

const CUSTOM_PRICE = 450;

const productTypes = [
  { type: "plate", label: "Tabak" },
  { type: "cup", label: "Bardak" },
  { type: "tray", label: "Tepsi" },
  { type: "vase", label: "Vazo" },
];

const colorPalette = [
  { id: "toprak", label: "Toprak Kırmızısı", value: "#a63d2f" },
  { id: "terracotta", label: "Terracotta", value: "#c56a3e" },
  { id: "zeytin", label: "Zeytin Yeşili", value: "#7d8c4a" },
  { id: "adacayi", label: "Adaçayı", value: "#8a9a7e" },
  { id: "krem", label: "Krem", value: "#e8dcc8" },
  { id: "kumbeji", label: "Kum Beji", value: "#d3bd94" },
  { id: "turkuaz", label: "Turkuaz", value: "#4a8b8c" },
  { id: "petrol", label: "Petrol Mavisi", value: "#2f6169" },
  { id: "antrasit", label: "Antrasit", value: "#3d2b1f" },
  { id: "kahve", label: "Kahve", value: "#5c4130" },
  { id: "beyaz", label: "Beyaz", value: "#f7f3ec" },
  { id: "hardal", label: "Hardal", value: "#c99a2e" },
];

const patternOptions = [
  { id: null, label: "Desensiz" },
  { id: "dots", label: "Benekler" },
  { id: "brush", label: "Fırça Darbeleri" },
  { id: "olive", label: "Zeytin Dalı" },
  { id: "wave", label: "Dalgalı Çizgiler" },
  { id: "leaves", label: "Yaprak Serpintisi" },
];

const steps = [
  { step: 1, label: "Ürün" },
  { step: 2, label: "Renk" },
  { step: 3, label: "Desen" },
  { step: 4, label: "Yazı" },
];

export function DesignPage() {
  const { addItem } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [type, setType] = useState(null);
  const [color, setColor] = useState(null);
  const [pattern, setPattern] = useState(null);
  const [text, setText] = useState("");

  function handleSelectType(nextType) {
    setType(nextType);
    setColor(colorPalette[0].value);
    setPattern(null);
  }

  function goNext() {
    setCurrentStep((step) => Math.min(step + 1, 4));
  }

  function goBack() {
    setCurrentStep((step) => Math.max(step - 1, 1));
  }

  function handleAddToCart() {
    const typeLabel = productTypes.find((item) => item.type === type).label;
    addItem({
      id: `custom-${Date.now()}`,
      name: `Özel Tasarım — ${typeLabel}`,
      price: CUSTOM_PRICE,
      custom: { type, color, pattern, text: text.trim() },
    });
    setCurrentStep(1);
    setType(null);
    setColor(null);
    setPattern(null);
    setText("");
  }

  return React.createElement(
    "div",
    null,
    React.createElement("h1", { className: "about-title" }, "Kendin Tasarla"),
    React.createElement(
      "div",
      { className: "design-stepper" },
      steps.map((item) =>
        React.createElement(
          "div",
          {
            key: item.step,
            className:
              "design-step" +
              (item.step === currentStep
                ? " design-step--active"
                : item.step < currentStep
                ? " design-step--done"
                : ""),
          },
          React.createElement(
            "span",
            { className: "design-step-number" },
            item.step < currentStep ? "✓" : item.step
          ),
          React.createElement("span", { className: "design-step-label" }, item.label)
        )
      )
    ),
    React.createElement(
      "div",
      { className: "design-section" },
      React.createElement(
        "div",
        { className: "design-step-panel" },
        currentStep === 1 &&
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
                    item.type === type
                      ? "design-type-button design-type-button--selected"
                      : "design-type-button",
                  onClick: () => handleSelectType(item.type),
                },
                React.createElement(CeramicPreview, { type: item.type, size: 64 }),
                React.createElement("span", null, item.label)
              )
            )
          ),
        currentStep === 2 &&
          React.createElement(
            "div",
            { className: "design-color-grid" },
            colorPalette.map((item) =>
              React.createElement("button", {
                key: item.id,
                type: "button",
                title: item.label,
                "aria-label": item.label,
                className:
                  item.value === color
                    ? "design-color-swatch design-color-swatch--selected"
                    : "design-color-swatch",
                style: { backgroundColor: item.value },
                onClick: () => setColor(item.value),
              })
            )
          ),
        currentStep === 3 &&
          React.createElement(
            "div",
            { className: "design-pattern-grid" },
            patternOptions.map((item) =>
              React.createElement(
                "button",
                {
                  key: item.id || "none",
                  type: "button",
                  className:
                    item.id === pattern
                      ? "design-pattern-button design-pattern-button--selected"
                      : "design-pattern-button",
                  onClick: () => setPattern(item.id),
                },
                React.createElement(CeramicPreview, { type, color, pattern: item.id, size: 56 }),
                React.createElement("span", null, item.label)
              )
            )
          ),
        currentStep === 4 &&
          React.createElement(
            "div",
            { className: "design-text-step" },
            React.createElement("input", {
              className: "card-form-input",
              type: "text",
              maxLength: 12,
              placeholder: "Örn. Sevgiler (opsiyonel)",
              value: text,
              onChange: (event) => setText(event.target.value),
            }),
            React.createElement("p", { className: "design-text-count" }, `${text.length}/12`)
          ),
        React.createElement(
          "div",
          { className: "design-step-actions" },
          currentStep > 1 &&
            React.createElement(
              "button",
              { type: "button", className: "card-button card-button--secondary", onClick: goBack },
              "Geri"
            ),
          currentStep < 4 &&
            React.createElement(
              "button",
              { type: "button", className: "card-button", onClick: goNext, disabled: currentStep === 1 && !type },
              "Devam"
            ),
          currentStep === 4 &&
            React.createElement(
              "button",
              { type: "button", className: "card-button", onClick: handleAddToCart },
              `Sepete Ekle — ${CUSTOM_PRICE}₺`
            )
        )
      ),
      React.createElement(
        "div",
        { className: "design-preview" },
        type
          ? React.createElement(CeramicPreview, { type, color, pattern, text: text.trim(), size: 200 })
          : React.createElement("p", { className: "design-preview-hint" }, "Bir ürün tipi seçin")
      )
    )
  );
}
