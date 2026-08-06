import { validatePayload } from "./validatePayload.js";
import { isRateLimited, getClientIp } from "./rateLimit.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const isPlaceOrder = req.body?.event === "place_order";
  // ponytail: place_order sepetteki her satır için ayrı istek atıyor (bkz. CLAUDE.md),
  // çok satırlı sepet limite takılmasın diye muaf — sepet satır sayısı büyürse limit gerekebilir.
  if (!isPlaceOrder && isRateLimited(getClientIp(req))) {
    return res.status(429).json({ error: "Çok fazla istek, lütfen biraz bekleyin." });
  }

  const result = validatePayload(req.body);
  if (!result.valid) {
    return res.status(400).json({ error: result.error });
  }

  try {
    const response = await fetch(process.env.WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.payload),
    });
    res.status(response.status).end();
  } catch (err) {
    res.status(502).json({ error: "Webhook forward failed" });
  }
}
