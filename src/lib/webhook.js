export const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL;

// webhook.site yanıtlarında Access-Control-Allow-Origin header'ı yok, bu yüzden
// normal "cors" modunda fetch her zaman "Failed to fetch" ile başarısız olur.
// "no-cors" isteği gerçekten gönderir ama yanıtı opaque yapar (status/ok okunamaz) —
// bu da hatayı yalnızca gerçek bir ağ/bağlantı sorununda (örn. çevrimdışı) yakalayabildiğimiz
// anlamına gelir, sunucu tarafı hatasını değil.
export async function sendWebhookEvent(payload) {
  await fetch(WEBHOOK_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(payload),
  });
}
