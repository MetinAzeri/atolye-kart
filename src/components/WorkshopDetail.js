import React from "https://esm.sh/react@18";
import { RegistrationForm } from "./RegistrationForm.js";

const { useState } = React;

function formatDisplayDate(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" });
}

export function WorkshopDetail({ workshop }) {
  const [showForm, setShowForm] = useState(false);

  return React.createElement(
    "div",
    { className: "workshop-detail" },
    React.createElement(
      "span",
      { className: "workshop-detail-badge", style: { backgroundColor: workshop.color } },
      workshop.label
    ),
    React.createElement("h3", { className: "workshop-detail-date" }, formatDisplayDate(workshop.date)),
    React.createElement("p", { className: "workshop-detail-meta" }, `${workshop.timeRange} · ${workshop.capacity}`),
    React.createElement("p", { className: "workshop-detail-description" }, workshop.description),
    !showForm &&
      React.createElement(
        "button",
        { type: "button", className: "card-button", onClick: () => setShowForm(true) },
        "Katıl"
      ),
    showForm && React.createElement(RegistrationForm, { workshop, onCancel: () => setShowForm(false) })
  );
}
