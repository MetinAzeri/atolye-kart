import React from "react";
import { QRCodeSVG } from "qrcode.react";

export function QrCode({ value, label, size = 120 }) {
  return React.createElement(
    "div",
    { className: "qr-code" },
    React.createElement(QRCodeSVG, { value, size }),
    React.createElement("p", { className: "qr-code-label" }, label)
  );
}
