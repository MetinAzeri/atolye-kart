export async function sendWebhookEvent(payload) {
  const response = await fetch("/api/atolye-kayit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Webhook isteği başarısız oldu");
  }
}
