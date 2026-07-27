import React from "https://esm.sh/react@18";
import { QRCodeSVG } from "https://esm.sh/qrcode.react@3";

export function QrCode({ value, label, size = 120 }) {
  return React.createElement(
    "div",
    { className: "qr-code" },
    React.createElement(QRCodeSVG, { value, size }),
    React.createElement("p", { className: "qr-code-label" }, label)
  );
}
