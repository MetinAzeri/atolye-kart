import React from "https://esm.sh/react@18";
import { shadeColor, getLuminance } from "../lib/color.js";

const { useId, createElement: h, Fragment } = React;

const NEUTRAL_COLOR = "#e4dcd0";
const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const leafPath = "M12 4 C18 8 18 16 12 20 C6 16 6 8 12 4 Z";

function patternTile(patternId, type, tint) {
  switch (type) {
    case "dots":
      // Benekler — reaktif sır: düzensiz boyut/opasitede lekeler + küçük sıçrama damlaları
      return h(
        "pattern",
        { id: patternId, width: 50, height: 50, patternUnits: "userSpaceOnUse" },
        h("circle", { cx: 10, cy: 12, r: 3, fill: tint, opacity: 0.7 }),
        h("circle", { cx: 28, cy: 8, r: 5, fill: tint, opacity: 0.55 }),
        h("circle", { cx: 31, cy: 11, r: 1, fill: tint, opacity: 0.6 }),
        h("circle", { cx: 40, cy: 20, r: 2.5, fill: tint, opacity: 0.8 }),
        h("circle", { cx: 15, cy: 30, r: 4, fill: tint, opacity: 0.6 }),
        h("circle", { cx: 35, cy: 38, r: 3.5, fill: tint, opacity: 0.75 }),
        h("circle", { cx: 37.5, cy: 40, r: 1.2, fill: tint, opacity: 0.55 }),
        h("circle", { cx: 6, cy: 42, r: 2, fill: tint, opacity: 0.65 }),
        h("circle", { cx: 44, cy: 44, r: 2.5, fill: tint, opacity: 0.5 })
      );
    case "brush":
      // Fırça Darbeleri — kalınlığı değişen, farklı açılarda dolgulu fırça izleri
      return h(
        "pattern",
        { id: patternId, width: 60, height: 40, patternUnits: "userSpaceOnUse" },
        h(
          "g",
          { transform: "translate(5 8) rotate(-15)", opacity: 0.75 },
          h("path", { d: "M0 3 Q10 0 20 2 Q10 5 0 3 Z", fill: tint })
        ),
        h(
          "g",
          { transform: "translate(28 5) rotate(20) scale(0.8)", opacity: 0.85 },
          h("path", { d: "M0 3 Q10 0 20 2 Q10 5 0 3 Z", fill: tint })
        ),
        h(
          "g",
          { transform: "translate(8 25) rotate(-30) scale(1.1)", opacity: 0.65 },
          h("path", { d: "M0 3 Q10 0 20 2 Q10 5 0 3 Z", fill: tint })
        ),
        h(
          "g",
          { transform: "translate(35 28) rotate(10) scale(0.9)", opacity: 0.7 },
          h("path", { d: "M0 3 Q10 0 20 2 Q10 5 0 3 Z", fill: tint })
        )
      );
    case "olive":
      // Zeytin Dalı — kavisli dal + iki yana alternatif yerleşen küçük yapraklar
      return h(
        "pattern",
        { id: patternId, width: 70, height: 70, patternUnits: "userSpaceOnUse" },
        h("path", {
          d: "M8 65 Q30 45 32 25 Q34 10 45 2",
          fill: "none",
          stroke: tint,
          strokeWidth: 1.5,
          strokeLinecap: "round",
          opacity: 0.8,
        }),
        h("ellipse", { cx: 15, cy: 55, rx: 6, ry: 2.5, fill: tint, opacity: 0.7, transform: "rotate(-30 15 55)" }),
        h("ellipse", { cx: 23, cy: 44, rx: 6, ry: 2.5, fill: tint, opacity: 0.75, transform: "rotate(40 23 44)" }),
        h("ellipse", { cx: 29, cy: 32, rx: 6, ry: 2.5, fill: tint, opacity: 0.7, transform: "rotate(-35 29 32)" }),
        h("ellipse", { cx: 34, cy: 19, rx: 6, ry: 2.5, fill: tint, opacity: 0.75, transform: "rotate(45 34 19)" }),
        h("ellipse", { cx: 41, cy: 9, rx: 5, ry: 2.2, fill: tint, opacity: 0.7, transform: "rotate(-30 41 9)" })
      );
    case "wave":
      // Dalgalı Çizgiler — el çizimi hissi veren, asimetrik genlikli dalga hatları
      return h(
        "pattern",
        { id: patternId, width: 80, height: 24, patternUnits: "userSpaceOnUse" },
        h("path", {
          d: "M0 8 Q8 2 18 9 Q26 14 34 7 Q42 1 50 8 Q60 13 68 6 Q74 2 80 8",
          fill: "none",
          stroke: tint,
          strokeWidth: 1.5,
          strokeLinecap: "round",
          opacity: 0.8,
        }),
        h("path", {
          d: "M0 18 Q10 14 20 19 Q28 22 36 17 Q46 12 54 18 Q62 21 70 16 Q76 13 80 18",
          fill: "none",
          stroke: tint,
          strokeWidth: 1.2,
          strokeLinecap: "round",
          opacity: 0.6,
        })
      );
    case "leaves":
      // Yaprak Serpintisi — aynı yaprak formunun farklı açı/boyutlarda serpiştirilmesi
      return h(
        "pattern",
        { id: patternId, width: 90, height: 90, patternUnits: "userSpaceOnUse" },
        h("path", { d: leafPath, fill: tint, opacity: 0.7, transform: "translate(10 10) rotate(15) scale(0.8)" }),
        h("path", { d: leafPath, fill: tint, opacity: 0.8, transform: "translate(55 15) rotate(-50) scale(1)" }),
        h("path", { d: leafPath, fill: tint, opacity: 0.6, transform: "translate(30 50) rotate(110) scale(0.7)" }),
        h("path", { d: leafPath, fill: tint, opacity: 0.75, transform: "translate(70 60) rotate(-20) scale(0.9)" }),
        h("path", { d: leafPath, fill: tint, opacity: 0.65, transform: "translate(15 70) rotate(60) scale(0.85)" })
      );
    default:
      return null;
  }
}

function computeFontSize(text) {
  const len = text.length;
  if (len <= 6) return 18;
  if (len >= 12) return 11;
  return Math.round(18 - ((len - 6) / 6) * 7);
}

function TextLayer({ x, y, text, baseColor }) {
  if (!text) return null;
  const fill = getLuminance(baseColor) > 0.55 ? "#3d2b1f" : "#f7f3ec";
  return h(
    "text",
    {
      x,
      y,
      textAnchor: "middle",
      fontSize: computeFontSize(text),
      fontWeight: 600,
      fontFamily: FONT_STACK,
      fill,
    },
    text
  );
}

export function CeramicPreview({ type, color, pattern, text, size = 120 }) {
  const uid = useId();
  const base = color || NEUTRAL_COLOR;
  const light = shadeColor(base, 30);
  const dark = shadeColor(base, -25);
  const edge = shadeColor(base, -15);
  const patternTint = pattern ? (getLuminance(base) > 0.55 ? shadeColor(base, -30) : shadeColor(base, 35)) : null;

  const gradId = `grad-${uid}`;
  const wellGradId = `well-${uid}`;
  const shadowGradId = `shadow-${uid}`;
  const clipId = `clip-${uid}`;
  const patternId = `pattern-${uid}`;

  const defs = [
    h(
      "linearGradient",
      { key: "g", id: gradId, x1: "0%", y1: "0%", x2: "100%", y2: "0%" },
      h("stop", { offset: "0%", stopColor: dark }),
      h("stop", { offset: "45%", stopColor: base }),
      h("stop", { offset: "100%", stopColor: light })
    ),
    h(
      "radialGradient",
      { key: "w", id: wellGradId, cx: "35%", cy: "35%", r: "75%" },
      h("stop", { offset: "0%", stopColor: light }),
      h("stop", { offset: "100%", stopColor: dark })
    ),
    h(
      "radialGradient",
      { key: "s", id: shadowGradId, cx: "50%", cy: "50%", r: "50%" },
      h("stop", { offset: "0%", stopColor: "#000", stopOpacity: 0.28 }),
      h("stop", { offset: "70%", stopColor: "#000", stopOpacity: 0.12 }),
      h("stop", { offset: "100%", stopColor: "#000", stopOpacity: 0 })
    ),
  ];

  let clipShape;
  let shapeElements;
  let textPos;

  if (type === "plate") {
    clipShape = h("ellipse", { cx: 100, cy: 100, rx: 85, ry: 50 });
    shapeElements = h(
      Fragment,
      null,
      h("ellipse", { cx: 100, cy: 100, rx: 85, ry: 50, fill: `url(#${gradId})`, stroke: edge, strokeWidth: 2.5 }),
      h("ellipse", {
        cx: 100,
        cy: 99,
        rx: 80,
        ry: 46,
        fill: "none",
        stroke: light,
        strokeWidth: 1,
        opacity: 0.5,
      }),
      h("ellipse", {
        cx: 100,
        cy: 103,
        rx: 60,
        ry: 35,
        fill: `url(#${wellGradId})`,
        stroke: dark,
        strokeWidth: 1,
        opacity: 0.9,
      })
    );
    textPos = { x: 100, y: 108 };
  } else if (type === "cup") {
    const bodyPath = "M58 55 L142 55 L132 160 Q132 170 122 170 L78 170 Q68 170 68 160 Z";
    const handlePath = "M138 74 C182 79 190 156 138 161 L138 145 C162 141 166 90 138 88 Z";
    clipShape = h("path", { d: bodyPath });
    shapeElements = h(
      Fragment,
      null,
      h("path", { d: handlePath, fill: `url(#${gradId})`, stroke: edge, strokeWidth: 2 }),
      h("path", {
        d: "M180 82 C186 105 184 138 140 156",
        fill: "none",
        stroke: light,
        strokeWidth: 1,
        opacity: 0.55,
      }),
      h("path", { d: bodyPath, fill: `url(#${gradId})`, stroke: edge, strokeWidth: 2.5 }),
      h("ellipse", { cx: 100, cy: 55, rx: 42, ry: 10, fill: dark }),
      h("ellipse", { cx: 100, cy: 55, rx: 42, ry: 10, fill: "none", stroke: edge, strokeWidth: 2 }),
      h("path", {
        d: "M62 51 Q100 44 138 51",
        fill: "none",
        stroke: light,
        strokeWidth: 1.2,
        opacity: 0.6,
      }),
      h("ellipse", {
        cx: 100,
        cy: 55,
        rx: 34,
        ry: 7,
        fill: "none",
        stroke: light,
        strokeWidth: 1,
        opacity: 0.35,
      })
    );
    textPos = { x: 100, y: 118 };
  } else if (type === "tray") {
    clipShape = h("rect", { x: 20, y: 55, width: 160, height: 95, rx: 30, ry: 30 });
    shapeElements = h(
      Fragment,
      null,
      h("rect", {
        x: 20,
        y: 55,
        width: 160,
        height: 95,
        rx: 30,
        ry: 30,
        fill: `url(#${gradId})`,
        stroke: edge,
        strokeWidth: 2.5,
      }),
      h("rect", {
        x: 26,
        y: 61,
        width: 148,
        height: 83,
        rx: 25,
        ry: 25,
        fill: "none",
        stroke: light,
        strokeWidth: 1,
        opacity: 0.5,
      }),
      h("rect", {
        x: 42,
        y: 72,
        width: 116,
        height: 61,
        rx: 18,
        ry: 18,
        fill: `url(#${wellGradId})`,
        stroke: dark,
        strokeWidth: 1,
        opacity: 0.9,
      })
    );
    textPos = { x: 100, y: 107 };
  } else {
    const bodyPath =
      "M85 20 L115 20 L115 45 Q155 65 155 112 Q155 168 100 168 Q45 168 45 112 Q45 65 85 45 Z";
    clipShape = h("path", { d: bodyPath });
    shapeElements = h(
      Fragment,
      null,
      h("path", { d: bodyPath, fill: `url(#${gradId})`, stroke: edge, strokeWidth: 2.5 }),
      h("ellipse", { cx: 100, cy: 20, rx: 15, ry: 5, fill: dark }),
      h("ellipse", { cx: 100, cy: 20, rx: 15, ry: 5, fill: "none", stroke: edge, strokeWidth: 1.5 }),
      h("path", {
        d: "M87 16 Q100 12 113 16",
        fill: "none",
        stroke: light,
        strokeWidth: 1,
        opacity: 0.6,
      }),
      h("path", { d: "M78 60 Q73 110 81 155", fill: "none", stroke: light, strokeWidth: 1, opacity: 0.4 }),
      h("path", { d: "M122 60 Q127 110 119 155", fill: "none", stroke: dark, strokeWidth: 1, opacity: 0.25 })
    );
    textPos = { x: 100, y: 118 };
  }

  return h(
    "svg",
    { width: size, height: (size * 220) / 200, viewBox: "0 0 200 220" },
    h(
      "defs",
      null,
      ...defs,
      pattern && h("clipPath", { id: clipId }, clipShape),
      pattern && patternTile(patternId, pattern, patternTint)
    ),
    h("ellipse", { cx: 100, cy: 198, rx: 62, ry: 12, fill: `url(#${shadowGradId})` }),
    shapeElements,
    pattern &&
      h("rect", {
        x: 0,
        y: 0,
        width: 200,
        height: 220,
        fill: `url(#${patternId})`,
        opacity: 0.55,
        clipPath: `url(#${clipId})`,
      }),
    h(TextLayer, { x: textPos.x, y: textPos.y, text, baseColor: base })
  );
}
