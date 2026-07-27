import React from "https://esm.sh/react@18";
import { sendWebhookEvent } from "../lib/webhook.js";

const { useState } = React;

export function RegistrationForm({ workshop, onCancel }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState(false);
  const [email, setEmail] = useState("");
  const [participantCount, setParticipantCount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (phone.length < 10 || phone.length > 11) {
      setPhoneError(true);
      return;
    }
    setPhoneError(false);

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
      placeholder: "Katılımcı Sayısı",
      value: participantCount,
      onChange: (event) => setParticipantCount(event.target.value),
      required: true,
    }),
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
