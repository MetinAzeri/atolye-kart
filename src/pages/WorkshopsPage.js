import React from "https://esm.sh/react@18";
import { WorkshopCalendar } from "../components/WorkshopCalendar.js";
import { WorkshopDetail } from "../components/WorkshopDetail.js";
import { workshops } from "../data/workshops.js";

const { useState } = React;

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function WorkshopsPage() {
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);

  return React.createElement(
    "div",
    null,
    React.createElement("h1", { className: "about-title" }, "Atölyeler"),
    React.createElement(
      "p",
      { className: "about-text", style: { marginBottom: "32px" } },
      "Büyükler, Baba-Çocuk ve Anne-Çocuk atölyelerimize takvimden uygun bir gün seçip katılabilirsiniz."
    ),
    React.createElement(WorkshopCalendar, {
      month,
      workshops,
      selectedDate: selectedWorkshop ? selectedWorkshop.date : null,
      onSelectDate: setSelectedWorkshop,
      onMonthChange: setMonth,
    }),
    selectedWorkshop && React.createElement(WorkshopDetail, { key: selectedWorkshop.date, workshop: selectedWorkshop })
  );
}
