import React from "react";
import { Link } from "react-router-dom";
import { sendWebhookEvent } from "../lib/webhook.js";
import { useCart } from "../context/CartContext.js";
import { useAuth } from "../context/AuthContext.js";
import { PaymentForm } from "./PaymentForm.js";

const { useState } = React;

export function CheckoutForm({ onCancel }) {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(user ? "payment" : "contact");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleContactSubmit(event) {
    event.preventDefault();

    if (phone.length < 10 || phone.length > 11) {
      setPhoneError(true);
      return;
    }
    setPhoneError(false);

    if (!consent) {
      setConsentError(true);
      return;
    }
    setConsentError(false);

    setSubmitting(true);
    setStep("payment");
  }

  async function handleConfirmPayment() {
    await Promise.all(
      items.map((item) =>
        sendWebhookEvent({
          event: "place_order",
          name: user ? user.username : name.trim(),
          productId: item.productId,
          productName: item.name,
          ...(phone.trim() ? { phone: phone.trim() } : {}),
          ...(email.trim() ? { email: email.trim() } : {}),
          quantity: item.quantity,
          source: "atolyekart",
        })
      )
    );
    clearCart();
    setFeedback({ type: "success", text: "Ödemeniz alındı, siparişiniz oluşturuldu!" });
  }

  if (feedback && feedback.type === "success") {
    return React.createElement(
      "p",
      { className: "card-form-message card-form-message--success" },
      feedback.text
    );
  }

  if (step === "payment") {
    return React.createElement(PaymentForm, {
      onConfirm: handleConfirmPayment,
      onBack: user ? onCancel : () => setStep("contact"),
    });
  }

  return React.createElement(
    "form",
    { className: "card-form", onSubmit: handleContactSubmit },
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
      type: "tel",
      placeholder: "Telefon (5XX XXX XX XX)",
      value: phone,
      onChange: (event) => {
        setPhone(event.target.value.replace(/\D/g, ""));
        setPhoneError(false);
      },
      required: true,
    }),
    phoneError &&
      React.createElement(
        "p",
        { className: "card-form-message card-form-message--error" },
        "Telefon numarası 10-11 haneli rakamlardan oluşmalı."
      ),
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
    React.createElement(
      "div",
      { className: "card-form-actions" },
      React.createElement(
        "button",
        { type: "submit", className: "card-button", disabled: submitting },
        "Devam"
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
