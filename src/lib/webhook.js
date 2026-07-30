export async function sendWebhookEvent(payload) {
  await fetch("/api/atolye-kayit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
