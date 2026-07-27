import React from "https://esm.sh/react@18";
import { QrCode } from "./QrCode.js";

const REPO_URL = "https://github.com/MetinAzeri/atolye-kart";

export function Footer() {
  return React.createElement(
    "footer",
    { className: "footer" },
    React.createElement(QrCode, { value: REPO_URL }),
    React.createElement("p", { className: "footer-copyright" }, "© 2026 Kilhane Atölye · El yapımı seramik")
  );
}
