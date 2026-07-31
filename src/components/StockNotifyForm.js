import React from "react";
import { Link } from "react-router-dom";
import { sendWebhookEvent } from "../lib/webhook.js";

const { useState } = React;

export function StockNotifyForm({ product, onCancel }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!consent) {
      setConsentError(true);
      return;
    }
    setConsentError(false);
    setSubmitting(true);
    setFeedback(null);
    try {
      await sendWebhookEvent({
        event: "request_stock_notification",
        name: name.trim(),
        productId: product.id,
        productName: product.name,
        email: email.trim(),
        source: "atolyekart",
      });
      setFeedback({
        type: "success",
        text: "Bildirim isteğiniz alındı, stok geldiğinde haber vereceğiz.",
      });
    } catch (error) {
      setFeedback({ type: "error", text: "Bir hata oluştu, lütfen tekrar deneyin." });
    } finally {
      setSubmitting(false);
    }
  }

  if (feedback && feedback.type === "success") {
    return React.createElement(
      "p",
      { className: "card-form-message card-form-message--success" },
      feedback.text
    );
  }

  return React.createElement(
    "form",
    { className: "card-form", onSubmit: handleSubmit },
    React.createElement("input", {
      className: "card-form-input",
      type: "text",
      placeholder: "Ad Soyad",
      value: name,
      onChange: (event) => setName(event.target.value),
      required: true,
    }),
    React.createElement("input", {
      className: "card-form-input",
      type: "email",
      placeholder: "E-posta",
      value: email,
      onChange: (event) => setEmail(event.target.value),
      required: true,
    }),
    React.createElement(
      "label",
      { className: "card-form-checkbox" },
      React.createElement("input", {
        type: "checkbox",
        checked: consent,
        onChange: (event) => {
          setConsent(event.target.checked);
          setConsentError(false);
        },
      }),
      React.createElement(
        "span",
        null,
        "Kişisel verilerimin işlenmesine ve ",
        React.createElement(Link, { to: "/privacy-policy" }, "Gizlilik Politikası"),
        "'nda belirtilen amaçlarla kullanılmasına izin veriyorum."
      )
    ),
    consentError &&
      React.createElement(
        "p",
        { className: "card-form-message card-form-message--error" },
        "Devam etmek için KVKK/gizlilik rızasını onaylamanız gerekiyor."
      ),
    feedback &&
      feedback.type === "error" &&
      React.createElement("p", { className: "card-form-message card-form-message--error" }, feedback.text),
    React.createElement(
      "div",
      { className: "card-form-actions" },
      React.createElement(
        "button",
        { type: "submit", className: "card-button", disabled: submitting },
        submitting ? "Gönderiliyor..." : "Gönder"
      ),
      React.createElement(
        "button",
        {
          type: "button",
          className: "card-button card-button--secondary",
          onClick: onCancel,
          disabled: submitting,
        },
        "Vazgeç"
      )
    )
  );
}
