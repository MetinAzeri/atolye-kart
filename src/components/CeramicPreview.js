import React from "https://esm.sh/react@18";
import { shadeColor, getLuminance } from "../lib/color.js";

const { useId, createElement: h, Fragment } = React;

const NEUTRAL_COLOR = "#e4dcd0";
const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

function patternTile(patternId, type, tint) {
  switch (type) {
    case "lines":
      return h(
        "pattern",
        { id: patternId, width: 8, height: 8, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" },
        h("line", { x1: 0, y1: 0, x2: 0, y2: 8, stroke: tint, strokeWidth: 2 })
      );
    case "dots":
      return h(
        "pattern",
        { id: patternId, width: 14, height: 14, patternUnits: "userSpaceOnUse" },
        h("circle", { cx: 7, cy: 7, r: 2, fill: tint })
      );
    case "leaf":
      return h(
        "pattern",
        { id: patternId, width: 24, height: 24, patternUnits: "userSpaceOnUse" },
        h("path", { d: "M12 4 C18 8 18 16 12 20 C6 16 6 8 12 4 Z", fill: tint })
      );
    case "triangle":
      return h(
        "pattern",
        { id: patternId, width: 16, height: 16, patternUnits: "userSpaceOnUse" },
        h("path", { d: "M0 16 L8 4 L16 16 Z", fill: tint })
      );
    case "wave":
      return h(
        "pattern",
        { id: patternId, width: 24, height: 12, patternUnits: "userSpaceOnUse" },
        h("path", { d: "M0 6 Q6 0 12 6 T24 6", fill: "none", stroke: tint, strokeWidth: 2 })
      );
    default:
      return null;
  }
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
      fontSize: 16,
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
  const clipId = `clip-${uid}`;
  const patternId = `pattern-${uid}`;

  const defs = [
    h(
      "linearGradient",
      { key: "g", id: gradId, x1: "0%", y1: "0%", x2: "100%", y2: "0%" },
      h("stop", { offset: "0%", stopColor: light }),
      h("stop", { offset: "45%", stopColor: base }),
      h("stop", { offset: "100%", stopColor: dark })
    ),
    h(
      "radialGradient",
      { key: "w", id: wellGradId, cx: "35%", cy: "35%", r: "75%" },
      h("stop", { offset: "0%", stopColor: light }),
      h("stop", { offset: "100%", stopColor: dark })
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
      h("ellipse", { cx: 100, cy: 100, rx: 85, ry: 50, fill: `url(#${gradId})`, stroke: edge, strokeWidth: 2 }),
      h("ellipse", { cx: 100, cy: 103, rx: 60, ry: 35, fill: `url(#${wellGradId})` })
    );
    textPos = { x: 100, y: 108 };
  } else if (type === "cup") {
    const bodyPath = "M58 55 L142 55 L132 160 Q132 170 122 170 L78 170 Q68 170 68 160 Z";
    clipShape = h("path", { d: bodyPath });
    shapeElements = h(
      Fragment,
      null,
      h("path", {
        d: "M138 82 C172 86 174 148 138 152 L138 140 C160 137 158 97 138 94 Z",
        fill: `url(#${gradId})`,
        stroke: edge,
        strokeWidth: 1.5,
      }),
      h("path", { d: bodyPath, fill: `url(#${gradId})`, stroke: edge, strokeWidth: 2 }),
      h("ellipse", { cx: 100, cy: 55, rx: 42, ry: 10, fill: dark }),
      h("ellipse", { cx: 100, cy: 55, rx: 42, ry: 10, fill: "none", stroke: edge, strokeWidth: 2 })
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
        strokeWidth: 2,
      }),
      h("rect", { x: 42, y: 72, width: 116, height: 61, rx: 18, ry: 18, fill: `url(#${wellGradId})` })
    );
    textPos = { x: 100, y: 107 };
  } else {
    const bodyPath =
      "M85 20 L115 20 L115 45 Q155 65 155 112 Q155 168 100 168 Q45 168 45 112 Q45 65 85 45 Z";
    clipShape = h("path", { d: bodyPath });
    shapeElements = h(
      Fragment,
      null,
      h("path", { d: bodyPath, fill: `url(#${gradId})`, stroke: edge, strokeWidth: 2 }),
      h("ellipse", { cx: 100, cy: 20, rx: 15, ry: 5, fill: dark }),
      h("ellipse", { cx: 100, cy: 20, rx: 15, ry: 5, fill: "none", stroke: edge, strokeWidth: 1.5 })
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
    h("ellipse", { cx: 100, cy: 198, rx: 60, ry: 10, fill: "#000", opacity: 0.15 }),
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
