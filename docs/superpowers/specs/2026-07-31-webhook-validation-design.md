# Webhook Serverless Function'a Doğrulama Ekleme

**Tarih:** 2026-07-31
**Durum:** Onaylandı

## Bağlam

Form/webhook/Supabase incelemesinde (`api/atolye-kayit.js`) hiçbir server-side sanitization veya format doğrulaması olmadığı tespit edildi: Vercel serverless function, `req.body`'yi hiç dokunmadan `WEBHOOK_URL`'e forward ediyor. Tüm doğrulama sadece client-side (HTML5 `required`/`type`, mevcut telefon uzunluk kontrolü) — DevTools veya doğrudan `curl` ile tamamen atlanabilir. Bu spec, `api/atolye-kayit.js`'e whitelist + alan uzunluk sınırı + e-posta/telefon format doğrulaması eklemeyi tanımlıyor.

## Kapsam kararları

- **Geçersiz istek davranışı:** 400 ile reddet (webhook'a hiç istek gitmez), sessizce temizleyip yine de iletme değil.
- **Client-side hata gösterimi:** Kapsam dahil — ama kod incelemesi sonucu, `RegistrationForm.js`/`StockNotifyForm.js`/`CheckoutForm.js`→`PaymentForm.js`'in üçünde de zaten `sendWebhookEvent` çağrısını saran try/catch + genel "Bir hata oluştu, lütfen tekrar deneyin." hata mesajı var. Tek gereken değişiklik: `src/lib/webhook.js`'teki `sendWebhookEvent`'in `response.ok` olmayan durumda throw etmesi — mevcut try/catch'ler devreye girer, form dosyalarında ek değişiklik gerekmiyor. (`LoginForm.js` webhook kullanmıyor, Supabase'e gidiyor — kapsam dışı.)
- **Telefon formatı:** `/^[0-9]{10,11}$/` — client'ın `onChange`'de zaten rakam dışını sildiği, `+90` öneki hiç üretmediği mevcut davranışla birebir aynı.
- **E-posta formatı:** Basit pattern (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/` benzeri) — RFC 5322 tam doğrulama değil, YAGNI.
- **`source` alanı:** Client'tan gelen değer tamamen yok sayılır, sunucu her zaman `"atolyekart"` yazar (spoof edilemez).

## Whitelist şemaları (event'e göre)

| Alan | `place_order` | `request_stock_notification` | `workshop_registration` | Kural |
|---|---|---|---|---|
| `event` | zorunlu | zorunlu | zorunlu | tam olarak bu 3 string'den biri |
| `name` | zorunlu | zorunlu | zorunlu | string, trim sonrası boş değil, max 100 karakter |
| `productId` | zorunlu | zorunlu | — | string, boş değil, max 100 karakter (katı pattern yok — `nar-cicegi-kase` gibi kebab-case ürünler ile `custom-1785480000000` gibi Kendin Tasarla id'leri farklı şekillerde) |
| `productName` | zorunlu | zorunlu | — | string, boş değil, max 200 karakter (`Özel Tasarım — Vazo` gibi isimlere yer bırakır) |
| `phone` | opsiyonel | — | zorunlu | verilmişse `/^[0-9]{10,11}$/` |
| `email` | opsiyonel | zorunlu | zorunlu | verilmişse basit e-posta pattern'i |
| `quantity` | zorunlu | — | — | tam sayı, 1-20 arası |
| `participantCount` | — | — | zorunlu | tam sayı, 1-20 arası |
| `workshopDate` | — | — | zorunlu | `/^\d{4}-\d{2}-\d{2}$/` |
| `workshopType` | — | — | zorunlu | string, boş değil, max 50 karakter |
| `source` | — | — | — | client değeri yok sayılır, sunucu `"atolyekart"` yazar |

`place_order`'da `phone`/`email` opsiyonel olma nedeni: giriş yapmış kullanıcılar için bu alanlar hiç gönderilmiyor (mevcut davranış, `CheckoutForm.js:40-41`) — whitelist bunu bozmamalı.

Whitelist dışı herhangi bir alan (yukarıdaki tabloda olmayan bir key) → 400.

## Dosya yapısı

- **Yeni:** `api/validatePayload.js` — saf fonksiyon `validatePayload(body)` → `{ valid: true, payload }` veya `{ valid: false, error }`. `payload`, whitelist'teki alanlarla sınırlı ve `source: "atolyekart"` sabitlenmiş halde döner.
- **Yeni:** `api/validatePayload.test.js` — `node:assert` ile küçük bir self-check, `node api/validatePayload.test.js` ile çalıştırılır. 3 event tipi için geçerli örnek + eksik alan/format hatası/whitelist dışı alan/bilinmeyen `event` için geçersiz örnekler.
- **Değişen:** `api/atolye-kayit.js` — handler `validatePayload`'ı çağırır, geçersizse `res.status(400).json({ error })`, geçerliyse `payload`'ı webhook'a iletir.
- **Değişen:** `src/lib/webhook.js` — `sendWebhookEvent`, `response.ok` değilse response body'deki `error` mesajıyla (yoksa genel bir mesajla) throw eder.

## Hata yönetimi

- **Sunucu:** Doğrulama başarısız → `400` + `{ error: "<açıklayıcı mesaj>" }`, webhook'a istek gitmez. Tek mesaj yeterli (ilk başarısız kural), alan bazlı hata listesi gerekmiyor — public API değil.
- **Client:** `sendWebhookEvent`, `!response.ok` olduğunda throw eder. Bu, `RegistrationForm.js`/`StockNotifyForm.js`/`CheckoutForm.js`'in mevcut try/catch bloklarında zaten yakalanıp genel hata mesajı olarak gösterilir — form dosyalarında değişiklik yok.

## Test

- `api/validatePayload.js` saf fonksiyon olduğu için `api/validatePayload.test.js` içinde framework'süz, `node:assert` tabanlı bir self-check yazılır: her 3 event tipi için 1 geçerli + en az 1 geçersiz (eksik zorunlu alan, format hatası, whitelist dışı alan, bilinmeyen `event`) örnek. `node api/validatePayload.test.js` ile çalıştırılır, projenin geri kalanında olduğu gibi bir test framework'ü kurulmuyor.
- Manuel doğrulama: `npm run dev` ile 3 formun (atölye kaydı, stok bildirimi, checkout) normal akışta hâlâ çalıştığını doğrula; ayrıca `curl` ile `api/atolye-kayit.js`'e whitelist dışı alan / format hatalı e-posta-telefon / bilinmeyen `event` içeren istekler gönderip `400` döndüğünü doğrula.

## Kapsam dışı

- Rate limiting / spam koruması.
- Alan bazlı (per-field) hata mesajları — tek genel mesaj yeterli.
- `LoginForm.js`/Supabase tarafı — zaten webhook kullanmıyor.
