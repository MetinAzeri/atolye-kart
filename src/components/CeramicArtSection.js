import React from "react";

const rows = [
  {
    image: "assets/ceramic-art/ceramic-art-1.jpg",
    text:
      "Toprağı ateşle buluşturup kalıcı bir forma dönüştürmek, insanlığın en eski zanaatlarından biri. Binlerce yıl önce ilk uygarlıklar suyu taşımak, yiyeceği saklamak için çamuru şekillendirmeyi öğrendiğinde, aslında bugün hâlâ sürdürdüğümüz bir geleneğin temelini atmışlardı. Mezopotamya'nın çömlekçi çarkından Çin'in porselen fırınlarına, seramik her zaman insanın doğayla kurduğu en dokunaklı ilişkilerden biri oldu — parmak izlerimizin toprakta iz bıraktığı, kırılgan ama binlerce yıl dayanabilen bir sanat.",
    highlight: "Toprağı ateşle buluşturup kalıcı bir forma dönüştürmek, insanlığın en eski zanaatlarından biri.",
  },
  {
    image: "assets/ceramic-art/ceramic-art-2.jpg",
    text:
      "Anadolu, bu mirasın en zengin durak noktalarından biri. İznik'in mavi-beyaz çinileri, Osmanlı saraylarını süsleyen desenleriyle dünya çapında bir zanaat dili yarattı; Kütahya'nın rengârenk el boyaması seramikleri yüzyıllardır aynı ustalıkla üretilmeye devam ediyor; Kapadokya'nın yumuşak dokusundaki Avanos toprağı ise, Kızılırmak kıyısında hâlâ çömlekçi çarkının döndüğü bir kasabaya adını verdi. Biz de bu köklü gelenekten ilham alıyor, kendi yorumumuzu katmaya çalışıyoruz.",
    highlight: "Anadolu, bu mirasın en zengin durak noktalarından biri.",
  },
  {
    image: "assets/ceramic-art/ceramic-art-3.jpg",
    text:
      "Çamurla çalışmak, elleri meşgul ederken zihni yavaşlatır. Çark döndükçe, parmaklarınız kilin direncini hissettikçe günün telaşı geride kalır — geriye sadece o an, o form ve ellerinizle kurduğunuz sessiz bir diyalog kalır. Atölyemizde her parça, bu yavaşlamanın, kendine ayrılan zamanın izini taşıyor. Belki de seramiğin bu kadar sevilmesinin sırrı da bu: hız çağında, elle ve sabırla üretilen az sayıda şeyden biri olması.",
    highlight: "Çamurla çalışmak, elleri meşgul ederken zihni yavaşlatır.",
  },
  {
    image: "assets/ceramic-art/ceramic-art-4.jpg",
    text:
      "Seri üretimin aksine, elde şekillendirilen her parça kendine has bir karaktere sahip. Bir kase asla bir öncekinin birebir aynısı olmaz; sırındaki hafif renk farkı, kenarındaki ince asimetri, o parçayı evinize özgü kılan küçük bir imza gibidir. Mutfağınıza, sofranıza koyduğunuz her Kilhane Atölye ürünü, aslında bu binlerce yıllık zanaatın günümüze taşınmış, sizin için şekillenmiş küçük bir parçasıdır.",
    highlight: "Seri üretimin aksine, elde şekillendirilen her parça kendine has bir karaktere sahip.",
  },
];

function renderHighlightedText(text, highlight) {
  if (!highlight) return text;
  const idx = text.indexOf(highlight);
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const after = text.slice(idx + highlight.length);
  return [before, React.createElement("strong", { key: "hl" }, highlight), after];
}

export function CeramicArtSection() {
  return React.createElement(
    "div",
    { className: "home-section" },
    React.createElement("h2", { className: "about-title" }, "Seramik Sanatı"),
    rows.map((row, index) =>
      React.createElement(
        "div",
        { key: row.image, className: "ceramic-row" },
        index % 2 === 0
          ? React.createElement(React.Fragment, null,
              React.createElement("img", { className: "ceramic-row-image", src: row.image, alt: "" }),
              React.createElement("p", { className: "about-text" }, renderHighlightedText(row.text, row.highlight))
            )
          : React.createElement(React.Fragment, null,
              React.createElement("p", { className: "about-text" }, renderHighlightedText(row.text, row.highlight)),
              React.createElement("img", { className: "ceramic-row-image", src: row.image, alt: "" })
            )
      )
    )
  );
}
