import React from "react";
import { Link } from "react-router-dom";
import { sendWebhookEvent } from "../lib/webhook.js";

const { useState } = React;

export function RegistrationForm({ workshop, onCancel }) {
  const capacity = parseInt(workshop.capacity, 10);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState(false);
  const [email, setEmail] = useState("");
  const [participantCount, setParticipantCount] = useState("");
  const [participantCountError, setParticipantCountError] = useState(false);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (phone.length < 10 || phone.length > 11) {
      setPhoneError(true);
      return;
    }
    setPhoneError(false);

    const count = Number(participantCount);
    if (!Number.isInteger(count) || count < 1 || count > capacity) {
      setParticipantCountError(true);
      return;
    }
    setParticipantCountError(false);

    if (!consent) {
      setConsentError(true);
      return;
    }
    setConsentError(false);

    setSubmitting(true);
    setFeedback(null);
    try {
      await sendWebhookEvent({
        event: "workshop_registration",
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        participantCount: Number(participantCount),
        workshopDate: workshop.date,
        workshopType: workshop.label,
        source: "atolyekart",
      });
      setFeedback({ type: "success", text: "Kaydınız alındı, teşekkürler!" });
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
    React.createElement("input", {
      className: "card-form-input",
      type: "number",
      min: 1,
      max: capacity,
      placeholder: "Katılımcı Sayısı",
      value: participantCount,
      onChange: (event) => {
        setParticipantCount(event.target.value);
        setParticipantCountError(false);
      },
      required: true,
    }),
    participantCountError &&
      React.createElement(
        "p",
        { className: "card-form-message card-form-message--error" },
        `Bu atölye en fazla ${capacity} kişiliktir.`
      ),
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
