import React from "https://esm.sh/react@18";

const monthNames = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
const dayNames = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function WorkshopCalendar({ month, workshops, selectedDate, onSelectDate, onMonthChange }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDate(today);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstOfMonth = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;

  const workshopByDate = {};
  workshops.forEach((w) => {
    workshopByDate[w.date] = w;
  });

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthIndex, day);
    const dateStr = formatDate(date);
    cells.push({
      day,
      dateStr,
      workshop: workshopByDate[dateStr] || null,
      isPast: dateStr < todayStr,
      isToday: dateStr === todayStr,
    });
  }

  const isCurrentMonth = year === today.getFullYear() && monthIndex === today.getMonth();

  function goPrevMonth() {
    onMonthChange(new Date(year, monthIndex - 1, 1));
  }

  function goNextMonth() {
    onMonthChange(new Date(year, monthIndex + 1, 1));
  }

  return React.createElement(
    "div",
    { className: "workshop-calendar" },
    React.createElement(
      "div",
      { className: "workshop-calendar-header" },
      React.createElement(
        "button",
        {
          type: "button",
          className: "workshop-nav-button",
          onClick: goPrevMonth,
          disabled: isCurrentMonth,
          "aria-label": "Önceki ay",
        },
        "←"
      ),
      React.createElement("span", { className: "workshop-calendar-title" }, `${monthNames[monthIndex]} ${year}`),
      React.createElement(
        "button",
        { type: "button", className: "workshop-nav-button", onClick: goNextMonth, "aria-label": "Sonraki ay" },
        "→"
      )
    ),
    React.createElement(
      "div",
      { className: "workshop-grid" },
      dayNames.map((name) => React.createElement("div", { key: name, className: "workshop-day-name" }, name)),
      cells.map((cell, index) => {
        if (!cell) {
          return React.createElement("div", { key: `blank-${index}`, className: "workshop-day workshop-day--empty" });
        }
        const classNames = ["workshop-day"];
        if (cell.isPast) classNames.push("workshop-day--past");
        if (cell.isToday) classNames.push("workshop-day--today");
        if (cell.workshop) classNames.push("workshop-day--has-event");
        if (cell.dateStr === selectedDate) classNames.push("workshop-day--selected");

        return React.createElement(
          "button",
          {
            key: cell.dateStr,
            type: "button",
            className: classNames.join(" "),
            disabled: cell.isPast || !cell.workshop,
            onClick: () => onSelectDate(cell.workshop),
          },
          React.createElement("span", { className: "workshop-day-number" }, cell.day),
          cell.workshop &&
            React.createElement(
              "span",
              { className: "workshop-day-event" },
              React.createElement("span", {
                className: "workshop-dot",
                style: { backgroundColor: cell.workshop.color },
              }),
              React.createElement("span", { className: "workshop-day-label" }, cell.workshop.label)
            )
        );
      })
    )
  );
}
