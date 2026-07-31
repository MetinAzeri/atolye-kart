import React from "react";

const SECTIONS = [
  {
    title: "Hangi Kişisel Veriler Toplanıyor",
    text:
      "Sipariş, atölye kaydı ve stok bildirimi formlarını doldurduğunuzda Ad Soyad, Telefon ve E-posta bilgilerinizi topluyoruz. Bu bilgiler yalnızca ilgili formu gönderdiğinizde, sizin girdiğiniz şekliyle alınır.",
  },
  {
    title: "Bu Veriler Ne Amaçla Kullanılıyor",
    text:
      "Topladığımız veriler; siparişinizin işleme alınması, atölye kaydınızın onaylanması ve stoğa giren ürünler için size bildirim gönderilmesi amacıyla kullanılır. Verileriniz bu amaçlar dışında kullanılmaz.",
  },
  {
    title: "Üçüncü Taraf Paylaşımı",
    text:
      "Form gönderimleri n8n webhook altyapısı üzerinden işlenir; hesap ve oturum bilgileriniz Supabase üzerinde saklanır. Verileriniz, sipariş/kayıt sürecinin işletilmesi dışında üçüncü taraflarla paylaşılmaz veya pazarlama amacıyla kullanılmaz.",
  },
  {
    title: "Veri Saklama Süresi",
    text:
      "Kişisel verileriniz, ilgili hesap veya sipariş kaydı silinene kadar saklanır. Hesabınızın veya kaydınızın silinmesini talep etmek için bizimle iletişime geçebilirsiniz.",
  },
  {
    title: "İletişim",
    text:
      "Kişisel verilerinizle ilgili sorularınız için info@kilhaneatolye.com adresinden bize ulaşabilirsiniz.",
  },
];

export function PrivacyPolicy() {
  return React.createElement(
    "div",
    { className: "privacy-page" },
    React.createElement("h1", { className: "privacy-title" }, "Gizlilik Politikası"),
    React.createElement(
      "p",
      { className: "privacy-intro" },
      "Bu sayfa, Kilhane Atölye üzerinden gönderdiğiniz formlarda hangi kişisel verilerin toplandığını ve bu verilerin nasıl kullanıldığını açıklar."
    ),
    SECTIONS.map((section) =>
      React.createElement(
        "section",
        { className: "privacy-section", key: section.title },
        React.createElement("h2", { className: "privacy-section-title" }, section.title),
        React.createElement("p", { className: "privacy-section-text" }, section.text)
      )
    )
  );
}
