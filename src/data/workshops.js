const rules = [
  {
    dayOfWeek: 2, // Salı
    type: "buyukler",
    label: "Büyükler",
    color: "#b5551f",
    timeRange: "14:00 – 16:00",
    capacity: "8 kişilik",
    description: "Çark başında temel şekillendirme teknikleriyle kendi kaseni veya bardağını yap.",
  },
  {
    dayOfWeek: 4, // Perşembe
    type: "baba-cocuk",
    label: "Baba-Çocuk",
    color: "#4a8b8c",
    timeRange: "16:00 – 17:30",
    capacity: "6 kişilik",
    description: "Babalar ve çocuklarının birlikte çamurla tanıştığı, keyifli ve paylaşımlı bir atölye.",
  },
  {
    dayOfWeek: 6, // Cumartesi
    type: "anne-cocuk",
    label: "Anne-Çocuk",
    color: "#7d8c4a",
    timeRange: "10:00 – 11:30",
    capacity: "6 kişilik",
    description: "Anneler ve çocuklarının el ele toprakla şekil verdiği, hafta sonuna özel bir atölye.",
  },
];

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateWorkshops(daysAhead = 90) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const workshops = [];

  for (let offset = 0; offset <= daysAhead; offset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    const rule = rules.find((r) => r.dayOfWeek === date.getDay());
    if (rule) {
      workshops.push({ ...rule, date: formatDate(date) });
    }
  }

  return workshops;
}

export const workshops = generateWorkshops();
