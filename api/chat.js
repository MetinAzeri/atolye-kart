import { isRateLimited, getClientIp } from "./rateLimit.js";

const MAX_LENGTH = 2000;

export function isValidChatInput(value) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= MAX_LENGTH;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (isRateLimited(getClientIp(req))) {
    return res.status(429).json({ error: "Çok fazla istek, lütfen biraz bekleyin." });
  }

  if (!isValidChatInput(req.body?.chatInput)) {
    return res.status(400).json({ error: "Geçersiz mesaj" });
  }

  try {
    const response = await fetch(process.env.N8N_CHAT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatInput: req.body.chatInput }),
    });
    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    res.status(502).json({ error: "Webhook forward failed" });
  }
}
