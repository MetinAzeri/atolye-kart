import React from "https://esm.sh/react@18";

const paths = {
  plate: React.createElement(
    React.Fragment,
    null,
    React.createElement("circle", { cx: 50, cy: 50, r: 38 }),
    React.createElement("circle", { cx: 50, cy: 50, r: 24 })
  ),
  cup: React.createElement(
    React.Fragment,
    null,
    React.createElement("path", { d: "M28 22 L62 22 L62 60 Q62 74 45 74 Q28 74 28 60 Z" }),
    React.createElement("path", { d: "M62 32 C80 32 80 58 62 58" })
  ),
  tray: React.createElement("rect", { x: 15, y: 30, width: 70, height: 40, rx: 18, ry: 18 }),
  vase: React.createElement("path", {
    d: "M42 12 L58 12 L58 26 Q78 40 78 60 Q78 84 50 84 Q22 84 22 60 Q22 40 42 26 Z",
  }),
};

export function ProductTypeIcon({ type, size = 48 }) {
  return React.createElement(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 100 100",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 3,
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },
    paths[type]
  );
}
