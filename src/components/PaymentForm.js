import React from "react";

const { useState } = React;

function formatCardNumber(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function PaymentForm({ onConfirm, onBack }) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await onConfirm();
    } catch (err) {
      setError("Bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setProcessing(false);
    }
  }

  return React.createElement(
    "form",
    { className: "card-form", onSubmit: handleSubmit },
    React.createElement("h3", { className: "about-title", style: { fontSize: "18px", margin: "0 0 4px" } }, "Ödeme Bilgileri"),
    React.createElement(
      "div",
      { className: "payment-card-preview" },
      React.createElement("div", { className: "payment-card-number" }, cardNumber || "•••• •••• •••• ••••"),
      React.createElement(
        "div",
        { className: "payment-card-bottom" },
        React.createElement("div", { className: "payment-card-name" }, (cardName || "AD SOYAD").toUpperCase()),
        React.createElement("div", { className: "payment-card-expiry" }, expiry || "AA/YY")
      )
    ),
    React.createElement("input", {
      className: "card-form-input",
      type: "text",
      inputMode: "numeric",
      placeholder: "Kart Numarası",
      value: cardNumber,
      onChange: (event) => setCardNumber(formatCardNumber(event.target.value)),
      maxLength: 19,
      required: true,
    }),
    React.createElement("input", {
      className: "card-form-input",
      type: "text",
      placeholder: "Kart Üzerindeki İsim",
      value: cardName,
      onChange: (event) => setCardName(event.target.value),
      required: true,
    }),
    React.createElement(
      "div",
      { className: "card-form-row" },
      React.createElement("input", {
        className: "card-form-input",
        type: "text",
        inputMode: "numeric",
        placeholder: "AA/YY",
        value: expiry,
        onChange: (event) => setExpiry(formatExpiry(event.target.value)),
        maxLength: 5,
        required: true,
      }),
      React.createElement("input", {
        className: "card-form-input",
        type: "text",
        inputMode: "numeric",
        placeholder: "CVV",
        value: cvv,
        onChange: (event) => setCvv(event.target.value.replace(/\D/g, "").slice(0, 3)),
        maxLength: 3,
        required: true,
      })
    ),
    React.createElement(
      "p",
      { className: "card-hint" },
      "Bu bir demo sitesidir, gerçek ödeme alınmamaktadır."
    ),
    error && React.createElement("p", { className: "card-form-message card-form-message--error" }, error),
    React.createElement(
      "div",
      { className: "card-form-actions" },
      React.createElement(
        "button",
        { type: "submit", className: "card-button", disabled: processing },
        processing
          ? React.createElement(
              React.Fragment,
              null,
              React.createElement("span", { className: "payment-spinner" }),
              "İşleniyor..."
            )
          : "Ödemeyi Onayla"
      ),
      React.createElement(
        "button",
        {
          type: "button",
          className: "card-button card-button--secondary",
          onClick: onBack,
          disabled: processing,
        },
        "Geri"
      )
    )
  );
}
