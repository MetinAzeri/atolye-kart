import React from "https://esm.sh/react@18";

const members = [
  {
    name: "Metin",
    photo: "assets/family/aile-metin.jpg",
    quote:
      "Bu atölyeyi kurarken aslında ellerimle bir şeyler yaratmanın verdiği huzuru arıyordum. Her parçada bir sabır dersi, her başarısız denemede yeni bir başlangıç var.",
  },
  {
    name: "Seda",
    photo: "assets/family/aile-seda.jpg",
    quote:
      "Toprağın elimde şekil almasını izlemek, günün telaşından uzaklaşabildiğim tek an. Kusurlu bile olsa, kendi ellerimizin izini taşıyan bir şey yaratmak çok değerli.",
  },
  {
    name: "Atlas",
    photo: "assets/family/aile-atlas.jpg",
    quote:
      "Çamurla oynamayı çok seviyorum! Annem ve babamla birlikte küçük kaseler yapıyoruz, bazen şekli bozuluyor ama gülüyoruz, tekrar deniyoruz.",
  },
];

const FAMILY_TEXT =
  "Bu atölye bizim için sadece bir iş değil, birlikte geçirdiğimiz zamanın, öğrendiğimiz sabrın ve yarattığımız hikayelerin adı. Kilhane Atölye, ailecek büyüttüğümüz küçük bir dünya.";

export function FamilySection() {
  return React.createElement(
    "div",
    { className: "family-section" },
    React.createElement("h2", { className: "about-title" }, "Aile"),
    React.createElement(
      "div",
      { className: "family-members" },
      members.map((member) =>
        React.createElement(
          "div",
          { key: member.name, className: "family-member-card" },
          React.createElement("img", { className: "family-member-photo", src: member.photo, alt: "" }),
          React.createElement("p", { className: "family-member-name" }, member.name),
          React.createElement("p", { className: "family-member-quote" }, member.quote)
        )
      )
    ),
    React.createElement(
      "div",
      { className: "family-photo-wrap" },
      React.createElement("img", {
        className: "family-photo",
        src: "assets/family/aile-hep-birlikte.jpg",
        alt: "",
      }),
      React.createElement("p", { className: "about-text family-text" }, FAMILY_TEXT)
    )
  );
}
