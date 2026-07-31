# `api/atolye-kayit.js`'e Basit Rate Limiting Ekleme

**Tarih:** 2026-07-31
**Durum:** Onaylandı

## Bağlam

`api/atolye-kayit.js`, üç form event'ini de (`workshop_registration`, `request_stock_notification`, `place_order`) tek bir Vercel serverless endpoint üzerinden karşılıyor (`src/lib/webhook.js`'teki `sendWebhookEvent`, hepsinde aynı `/api/atolye-kayit`'e POST atıyor). Şu an bu endpoint'e aynı IP'den saniyede onlarca istek atılabilir — hiçbir rate limiting yok. Bu spec, aynı IP'nin 1 dakikada belirli sayıdan fazla istek atamamasını tanımlıyor.

## Kapsam kararları

- **Sayaç depolama:** In-memory `Map` (modül scope'unda, fonksiyon instance'ı ayakta kaldığı sürece yaşar). Yeni bir servise/tabloya bağımlılık yok, ama Vercel'in soğuk başlangıçlarında veya paralel instance'larda sıfırlanabilir — dağıtık olarak tam doğru değil, "best-effort" bir koruma. Trafik artarsa Supabase Postgres tablosu veya Vercel KV/Upstash Redis'e yükseltilebilir.
- **Limit anahtarı:** Sadece IP adresi (`x-forwarded-for` ilk değeri, yoksa `x-real-ip`, o da yoksa `"unknown"`). Giriş yapmış/yapmamış ayrımı yok.
- **Limit:** 1 dakikalık sabit pencerede (fixed window) aynı IP'den en fazla **5 istek**.
- **`place_order` muafiyeti:** `CheckoutForm.js`, sepetteki her ürün için ayrı bir webhook isteği gönderiyor (`Promise.all` ile eş zamanlı) — 6 ürünlük bir sepette tek "Siparişi Tamamla" tıklaması 6 istek üretiyor. Bu yüzden `event === "place_order"` olan istekler rate limit sayacına hiç girmiyor; sadece `workshop_registration` ve `request_stock_notification` sayılıyor (bunlar zaten tekli, tekrarlanan spam formları).
- **Sayaç, hem geçerli hem geçersiz istekleri sayar:** Rate limit kontrolü `validatePayload`'dan ÖNCE çalışır — böylece biri geçersiz (400 dönen) payload'larla limiti bypass edip sınırsız istek atamaz.
- **429 mesajı:** Client tarafında hiçbir değişiklik gerekmiyor. `sendWebhookEvent` (önceki webhook-validation planında) zaten `!response.ok`'ta throw ediyor; `RegistrationForm.js`/`StockNotifyForm.js`'in mevcut try/catch'i bunu yakalayıp genel "Bir hata oluştu, lütfen tekrar deneyin." mesajını gösteriyor.

## Dosya yapısı

- **Yeni:** `api/rateLimit.js` — `isRateLimited(key, now = Date.now())` ve `getClientIp(req)` fonksiyonlarını export eder.
- **Yeni:** `api/rateLimit.test.js` — `node:assert` tabanlı self-check, `node api/rateLimit.test.js` ile çalıştırılır.
- **Değişen:** `api/atolye-kayit.js` — method kontrolünden hemen sonra, `place_order` değilse `isRateLimited(getClientIp(req))` kontrolü eklenir; limit aşılırsa `429` + `{ error }` döner, `validatePayload`'a hiç gidilmez.

## Modül tasarımı — `api/rateLimit.js`

```js
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const requestLog = new Map(); // ip -> timestamp[]

export function isRateLimited(key, now = Date.now()) {
  const recent = (requestLog.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    requestLog.set(key, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(key, recent);
  return false;
}

export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers["x-real-ip"] || "unknown";
}
```

`now` parametresi sadece testlerde sahte zaman damgası enjekte etmek için var — gerçek çağıran taraf (`api/atolye-kayit.js`) hiç geçmiyor, varsayılan `Date.now()` kullanılıyor.

## Handler entegrasyonu — `api/atolye-kayit.js`

```js
import { validatePayload } from "./validatePayload.js";
import { isRateLimited, getClientIp } from "./rateLimit.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const isPlaceOrder = req.body?.event === "place_order";
  if (!isPlaceOrder && isRateLimited(getClientIp(req))) {
    return res.status(429).json({ error: "Çok fazla istek, lütfen biraz bekleyin." });
  }

  const result = validatePayload(req.body);
  if (!result.valid) {
    return res.status(400).json({ error: result.error });
  }

  // mevcut fetch/webhook forward mantığı değişmiyor
}
```

## Hata yönetimi

- `429` + `{ error: "Çok fazla istek, lütfen biraz bekleyin." }`, webhook'a istek gitmez.
- Client'ta değişiklik yok — mevcut throw-on-error + try/catch zinciri (webhook-validation planından) bunu zaten karşılıyor.

## Test

- `api/rateLimit.js` saf, `now` enjekte edilebilir olduğu için `api/rateLimit.test.js` içinde `node:assert` ile framework'süz self-check: aynı key'e ardışık 5 çağrı → hepsi `false` (limitli değil); 6. çağrı → `true`; farklı bir key'in kendi sayacı etkilenmiyor; sahte `now` ile pencere ötesine geçilince (`now + WINDOW_MS + 1`) sayaç sıfırlanıp tekrar `false` dönüyor.
- `api/atolye-kayit.js`'e entegrasyon, önceki webhook-validation planındaki gibi mocked `req`/`res`/`fetch` ile controller tarafında manuel doğrulanacak (commit edilmeyen bir script'le) — bu repo'da otomatik test framework'ü yok, bu proje genelinde tutarlı.

## Bilinen sınırlama

Kod içinde `// ponytail: in-memory rate limit, tek instance'a özel — trafik artarsa Supabase/Redis'e taşı` yorumuyla işaretlenecek. In-memory `Map`, Vercel'in soğuk başlangıçlarında veya paralel instance'larda sıfırlanır; dağıtık olarak tam doğru bir limit değildir, düşük trafikli bu site için "best-effort" bir koruma yeterli kabul edildi.

## Kapsam dışı

- `place_order` için ayrı bir sepet-bazlı gruplama/limitleme (kasıtlı olarak muaf tutuldu).
- IP dışında bir kimlik (Supabase user id vb.) bazlı limitleme.
- Kalıcı/dağıtık rate limit deposu (Supabase tablosu, Redis) — gelecekte trafik gerektirirse ayrı bir plan.
