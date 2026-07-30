import React from "react";

const ABOUT_TEXT =
  "Her şey bir avuç toprak ve sabırla başladı. Kilhane Atölye, elleriyle üretmenin değerine inanan birkaç ustanın bir araya gelmesiyle doğdu. Burada her kase, her vazo, saatlerce çamurun tekerlek üzerinde şekillenmesiyle, sırının özenle sürülmesiyle, fırının ateşiyle hayat buluyor. Bize göre bir seramik parçası sadece bir eşya değil — o günün ruh haliyle şekillenen, kusurları bile güzel olan bir emek hikâyesi. Seri üretimin aksine, burada aynı iki parça birbirinin tıpatıp aynısı olmaz; her biri kendine has bir karaktere sahiptir. Mutfağınıza, sofranıza koyduğunuz her parçayla, aslında bir zanaatkârın elinden geçmiş bir hikâyeyi de eve taşımış olursunuz.";

export function AboutSection() {
  return React.createElement(
    "div",
    { className: "about-section" },
    React.createElement(
      "div",
      { className: "about-text-block" },
      React.createElement("h2", { className: "about-title" }, "Biz Kimiz"),
      React.createElement("p", { className: "about-text" }, ABOUT_TEXT)
    ),
    React.createElement(
      "div",
      { className: "about-gallery" },
      React.createElement("img", { src: "assets/about/biz-kimiz-1.jpg", alt: "" }),
      React.createElement("img", { src: "assets/about/biz-kimiz-2.jpg", alt: "" }),
      React.createElement("img", { src: "assets/about/biz-kimiz-3.jpg", alt: "" })
    )
  );
}
