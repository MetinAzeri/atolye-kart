# Webhook Doğrulama Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `api/atolye-kayit.js` (Vercel serverless function) için whitelist + alan uzunluk sınırı + e-posta/telefon format doğrulaması eklemek; doğrulama başarısız olursa webhook'a hiç istek gitmeden 400 dönmek; client'ın bu hatayı yakalayabilmesi için `sendWebhookEvent`'i güncellemek.

**Architecture:** Doğrulama mantığı saf bir fonksiyona (`api/validatePayload.js`) çıkarılır — `event` tipine göre whitelist şemasına karşı kontrol eder, geçerliyse normalize edilmiş (`source` sunucuda sabitlenmiş) bir payload döner. `api/atolye-kayit.js` bu fonksiyonu çağırıp geçersizse 400 döner. `src/lib/webhook.js`'teki `sendWebhookEvent`, `response.ok` değilse throw eder — bu, `RegistrationForm.js`/`StockNotifyForm.js`/`CheckoutForm.js`'in zaten sahip olduğu try/catch bloklarında yakalanır.

**Tech Stack:** Node.js (Vercel serverless function, ESM — `package.json`'da `"type": "module"`), `node:assert` (framework'süz self-check testi).

## Global Constraints

- Tüm alan adları camelCase (proje geneli konvansiyonu, bkz. `docs/superpowers/specs/2026-07-31-webhook-validation-design.md`).
- Geçersiz istek → `400` + `{ error: "<mesaj>" }`, webhook'a hiç istek gitmez (sessizce temizleyip iletme değil).
- `source` alanı client'tan gelen değer ne olursa olsun sunucuda her zaman `"atolyekart"` olarak sabitlenir.
- Otomatik test framework'ü yok (projenin geri kalanında da yok) — `api/validatePayload.js` saf fonksiyon olduğu için `node:assert` ile framework'süz bir self-check dosyası (`node api/validatePayload.test.js` ile çalıştırılır) yeterli.
- `LoginForm.js`'e dokunulmuyor — webhook kullanmıyor, Supabase'e gidiyor.
- Whitelist şemaları ve format kuralları tasarım dokümanındaki tabloyla birebir aynı olmalı (bkz. Task 1).

---

## Dosya Yapısı

- **Create:** `api/validatePayload.js` — saf doğrulama fonksiyonu.
- **Create:** `api/validatePayload.test.js` — `node:assert` tabanlı self-check.
- **Modify:** `api/atolye-kayit.js` — handler'a doğrulama adımı eklenir.
- **Modify:** `src/lib/webhook.js` — `sendWebhookEvent`, `response.ok` değilse throw eder.

---

### Task 1: `api/validatePayload.js` — whitelist + format doğrulama fonksiyonu

**Files:**
- Create: `api/validatePayload.js`
- Test: `api/validatePayload.test.js`

**Interfaces:**
- Produces: `export function validatePayload(body)` → `{ valid: true, payload: object } | { valid: false, error: string }`. `payload`, sadece ilgili event'in whitelist'indeki alanları içerir (string alanlar trim edilmiş), `source` her zaman `"atolyekart"`. Task 2 bu fonksiyonu import edip kullanacak.

- [ ] **Step 1: Test dosyasını yaz (self-check, henüz fonksiyon yok)**

`api/validatePayload.test.js` dosyasını oluştur:

```js
import assert from "node:assert";
import { validatePayload } from "./validatePayload.js";

// place_order: geçerli, source spoof edilmeye çalışılıyor
{
  const result = validatePayload({
    event: "place_order",
    name: "Ayşe Yılmaz",
    productId: "nar-cicegi-kase",
    productName: "Nar Çiçeği Kase",
    quantity: 2,
    source: "spoofed",
  });
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.payload.source, "atolyekart");
  assert.strictEqual(result.payload.name, "Ayşe Yılmaz");
  assert.strictEqual(result.payload.quantity, 2);
}

// place_order: giriş yapmış kullanıcı senaryosu — phone/email hiç yok
{
  const result = validatePayload({
    event: "place_order",
    name: "kullanici_adi",
    productId: "nar-cicegi-kase",
    productName: "Nar Çiçeği Kase",
    quantity: 1,
  });
  assert.strictEqual(result.valid, true);
  assert.strictEqual("phone" in result.payload, false);
  assert.strictEqual("email" in result.payload, false);
}

// place_order: eksik zorunlu alan (quantity yok)
{
  const result = validatePayload({
    event: "place_order",
    name: "Ayşe Yılmaz",
    productId: "nar-cicegi-kase",
    productName: "Nar Çiçeği Kase",
  });
  assert.strictEqual(result.valid, false);
}

// place_order: whitelist dışı alan
{
  const result = validatePayload({
    event: "place_order",
    name: "Ayşe Yılmaz",
    productId: "nar-cicegi-kase",
    productName: "Nar Çiçeği Kase",
    quantity: 2,
    extraField: "hack",
  });
  assert.strictEqual(result.valid, false);
}

// place_order: geçersiz e-posta formatı
{
  const result = validatePayload({
    event: "place_order",
    name: "Ayşe Yılmaz",
    productId: "nar-cicegi-kase",
    productName: "Nar Çiçeği Kase",
    quantity: 2,
    email: "not-an-email",
  });
  assert.strictEqual(result.valid, false);
}

// place_order: quantity aralık dışı
{
  const result = validatePayload({
    event: "place_order",
    name: "Ayşe Yılmaz",
    productId: "nar-cicegi-kase",
    productName: "Nar Çiçeği Kase",
    quantity: 50,
  });
  assert.strictEqual(result.valid, false);
}

// request_stock_notification: geçerli
{
  const result = validatePayload({
    event: "request_stock_notification",
    name: "Ayşe Yılmaz",
    productId: "silindir-vazo",
    productName: "Silindir Vazo",
    email: "ayse@example.com",
  });
  assert.strictEqual(result.valid, true);
}

// request_stock_notification: email eksik (bu event'te zorunlu)
{
  const result = validatePayload({
    event: "request_stock_notification",
    name: "Ayşe Yılmaz",
    productId: "silindir-vazo",
    productName: "Silindir Vazo",
  });
  assert.strictEqual(result.valid, false);
}

// workshop_registration: geçerli
{
  const result = validatePayload({
    event: "workshop_registration",
    name: "Ayşe Yılmaz",
    phone: "5321234567",
    email: "ayse@example.com",
    participantCount: 2,
    workshopDate: "2026-08-04",
    workshopType: "Baba-Çocuk",
  });
  assert.strictEqual(result.valid, true);
}

// workshop_registration: geçersiz telefon formatı (+90 önekli)
{
  const result = validatePayload({
    event: "workshop_registration",
    name: "Ayşe Yılmaz",
    phone: "+905321234567",
    email: "ayse@example.com",
    participantCount: 2,
    workshopDate: "2026-08-04",
    workshopType: "Baba-Çocuk",
  });
  assert.strictEqual(result.valid, false);
}

// workshop_registration: geçersiz tarih formatı
{
  const result = validatePayload({
    event: "workshop_registration",
    name: "Ayşe Yılmaz",
    phone: "5321234567",
    email: "ayse@example.com",
    participantCount: 2,
    workshopDate: "04-08-2026",
    workshopType: "Baba-Çocuk",
  });
  assert.strictEqual(result.valid, false);
}

// workshop_registration: participantCount aralık dışı
{
  const result = validatePayload({
    event: "workshop_registration",
    name: "Ayşe Yılmaz",
    phone: "5321234567",
    email: "ayse@example.com",
    participantCount: 50,
    workshopDate: "2026-08-04",
    workshopType: "Baba-Çocuk",
  });
  assert.strictEqual(result.valid, false);
}

// bilinmeyen event tipi
{
  const result = validatePayload({ event: "delete_everything", name: "x" });
  assert.strictEqual(result.valid, false);
}

// body obje değil
{
  const result = validatePayload(null);
  assert.strictEqual(result.valid, false);
}

console.log("Tüm validatePayload testleri geçti ✓");
```

- [ ] **Step 2: Testi çalıştırıp başarısız olduğunu doğrula**

Run: `node api/validatePayload.test.js`
Expected: `Cannot find module './validatePayload.js'` hatasıyla FAIL (dosya henüz yok).

- [ ] **Step 3: `api/validatePayload.js`'i yaz**

```js
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9]{10,11}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const SCHEMAS = {
  place_order: {
    required: ["name", "productId", "productName", "quantity"],
    optional: ["phone", "email"],
  },
  request_stock_notification: {
    required: ["name", "productId", "productName", "email"],
    optional: [],
  },
  workshop_registration: {
    required: ["name", "phone", "email", "participantCount", "workshopDate", "workshopType"],
    optional: [],
  },
};

function isNonEmptyString(value, maxLength) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;
}

function isValidInteger(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max;
}

const FIELD_VALIDATORS = {
  name: (value) => isNonEmptyString(value, 100),
  productId: (value) => isNonEmptyString(value, 100),
  productName: (value) => isNonEmptyString(value, 200),
  phone: (value) => typeof value === "string" && PHONE_PATTERN.test(value),
  email: (value) => typeof value === "string" && EMAIL_PATTERN.test(value),
  quantity: (value) => isValidInteger(value, 1, 20),
  participantCount: (value) => isValidInteger(value, 1, 20),
  workshopDate: (value) => typeof value === "string" && DATE_PATTERN.test(value),
  workshopType: (value) => isNonEmptyString(value, 50),
};

export function validatePayload(body) {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Payload bir obje olmalı" };
  }

  const schema = SCHEMAS[body.event];
  if (!schema) {
    return { valid: false, error: "Bilinmeyen event tipi" };
  }

  const allowedKeys = new Set(["event", "source", ...schema.required, ...schema.optional]);
  const extraKey = Object.keys(body).find((key) => !allowedKeys.has(key));
  if (extraKey) {
    return { valid: false, error: `Beklenmeyen alan: ${extraKey}` };
  }

  for (const field of schema.required) {
    if (body[field] === undefined) {
      return { valid: false, error: `Eksik alan: ${field}` };
    }
    if (!FIELD_VALIDATORS[field](body[field])) {
      return { valid: false, error: `Geçersiz alan: ${field}` };
    }
  }

  for (const field of schema.optional) {
    if (body[field] !== undefined && !FIELD_VALIDATORS[field](body[field])) {
      return { valid: false, error: `Geçersiz alan: ${field}` };
    }
  }

  const payload = { event: body.event, source: "atolyekart" };
  for (const field of [...schema.required, ...schema.optional]) {
    if (body[field] !== undefined) {
      payload[field] = typeof body[field] === "string" ? body[field].trim() : body[field];
    }
  }

  return { valid: true, payload };
}
```

- [ ] **Step 4: Testi çalıştırıp geçtiğini doğrula**

Run: `node api/validatePayload.test.js`
Expected: `Tüm validatePayload testleri geçti ✓` yazdırılır, hata/exception yok, exit code 0.

- [ ] **Step 5: Commit**

```bash
git add api/validatePayload.js api/validatePayload.test.js
git commit -m "Webhook payload'ları için whitelist + format doğrulama fonksiyonu ekle"
```

---

### Task 2: `api/atolye-kayit.js` — doğrulamayı handler'a bağla

**Files:**
- Modify: `api/atolye-kayit.js:1-17` (tüm dosya)

**Interfaces:**
- Consumes: `validatePayload(body)` (Task 1) → `{ valid: true, payload } | { valid: false, error }`.

- [ ] **Step 1: `api/atolye-kayit.js`'i yeniden yaz**

Dosyanın tamamını şu içerikle değiştir:

```js
import { validatePayload } from "./validatePayload.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
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
```

- [ ] **Step 2: `validatePayload`'ın testinin hâlâ geçtiğini doğrula**

Run: `node api/validatePayload.test.js`
Expected: `Tüm validatePayload testleri geçti ✓` (bu görev `validatePayload.js`'e dokunmuyor, sadece kontrol amaçlı).

- [ ] **Step 3: Vercel dev ile manuel doğrulama (opsiyonel, `vercel` CLI kuruluysa)**

Eğer ortamda `vercel dev` çalıştırılabiliyorsa: whitelist dışı alan içeren bir istek gönder ve `400` döndüğünü doğrula:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/atolye-kayit \
  -H "Content-Type: application/json" \
  -d '{"event":"place_order","name":"Test","productId":"x","productName":"y","quantity":1,"hackField":"x"}'
```

Expected: `400`. Eğer `vercel dev` bu ortamda çalıştırılamıyorsa bu adımı atla ve Task 4'te (üretim/gerçek deploy sonrası) doğrula — bunu raporunda belirt.

- [ ] **Step 4: Commit**

```bash
git add api/atolye-kayit.js
git commit -m "atolye-kayit handler'ına validatePayload doğrulamasını bağla"
```

---

### Task 3: `src/lib/webhook.js` — başarısız yanıtta throw et

**Files:**
- Modify: `src/lib/webhook.js:1-7` (tüm dosya)

**Interfaces:**
- Produces: `sendWebhookEvent(payload)` artık `response.ok` `false` olduğunda throw eder (`Error`, mesajı sunucunun döndüğü `{ error }` body'sinden alır, yoksa genel bir mesaj). Başarılı durumda davranış değişmedi (hâlâ hiçbir şey return etmiyor).
- Consumes (mevcut, değişmeyen): `RegistrationForm.js`, `StockNotifyForm.js`, `CheckoutForm.js`'in `sendWebhookEvent` çağrılarını saran try/catch blokları — bu görev onlara dokunmuyor, throw edilen hata zaten oradaki catch'lerde yakalanıp genel "Bir hata oluştu, lütfen tekrar deneyin." mesajıyla gösteriliyor.

- [ ] **Step 1: `src/lib/webhook.js`'i yeniden yaz**

```js
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
```

- [ ] **Step 2: `npm run build` ile derlemenin bozulmadığını doğrula**

Run: `npm run build`
Expected: Hatasız tamamlanır (bu değişiklik saf JS, tip/derleme etkisi yok — ama import zincirinde syntax hatası olmadığını doğrulamak için çalıştır).

- [ ] **Step 3: Commit**

```bash
git add src/lib/webhook.js
git commit -m "sendWebhookEvent'i başarısız yanıtta throw edecek şekilde güncelle"
```

---

### Task 4: Uçtan uca manuel doğrulama

**Files:**
- Değişiklik yok — Task 1-3'ün birlikte doğru çalıştığını doğrular.

**Interfaces:**
- Consumes: Task 1-3'te tamamlanan `validatePayload`/`atolye-kayit`/`sendWebhookEvent`.

- [ ] **Step 1: `npm run dev` ile normal (geçerli veri gönderen) akışların bozulmadığını doğrula**

1. `/#/atolyeler`'e git, bir atölyeye "Katıl", formu geçerli bilgilerle gönder → başarı mesajını doğrula (webhook.site'da `workshop_registration` isteğinin geldiğini kontrol et).
2. Stokta olmayan bir üründe "Stok Bildirimi İste" formunu geçerli bilgilerle gönder → başarı mesajını doğrula (webhook.site'da `request_stock_notification`).
3. Sepete ürün ekleyip "Siparişi Tamamla" ile (giriş yapmadan) iletişim + sahte ödeme adımlarını geçerli bilgilerle tamamla → başarı mesajını doğrula (webhook.site'da `place_order`, `phone`/`email` alanları dolu).
4. Giriş yapıp aynı akışı tekrarla → webhook.site'da `place_order`'da `phone`/`email` alanlarının hiç olmadığını doğrula (davranış Task 1-3 öncesiyle aynı kalmalı).

- [ ] **Step 2: Geçersiz isteklerin gerçekten reddedildiğini doğrula**

Gerçek deploy'da (Vercel production/preview URL) veya `vercel dev` çalıştırılabiliyorsa lokal'de:

```bash
# Whitelist dışı alan
curl -s -o /dev/null -w "%{http_code}\n" -X POST <BASE_URL>/api/atolye-kayit \
  -H "Content-Type: application/json" \
  -d '{"event":"place_order","name":"Test","productId":"x","productName":"y","quantity":1,"hack":"x"}'
# Expected: 400

# Geçersiz e-posta formatı
curl -s -o /dev/null -w "%{http_code}\n" -X POST <BASE_URL>/api/atolye-kayit \
  -H "Content-Type: application/json" \
  -d '{"event":"request_stock_notification","name":"Test","productId":"x","productName":"y","email":"bozuk"}'
# Expected: 400

# Bilinmeyen event
curl -s -o /dev/null -w "%{http_code}\n" -X POST <BASE_URL>/api/atolye-kayit \
  -H "Content-Type: application/json" \
  -d '{"event":"delete_everything"}'
# Expected: 400

# Geçerli istek hâlâ 200 dönüyor mu (webhook.site'a gerçekten gitmesin istemiyorsan atla, sadece status kontrolü yeterli)
curl -s -o /dev/null -w "%{http_code}\n" -X POST <BASE_URL>/api/atolye-kayit \
  -H "Content-Type: application/json" \
  -d '{"event":"request_stock_notification","name":"Test","productId":"x","productName":"y","email":"test@example.com"}'
# Expected: 200 (webhook.site'a da bu istek gider, temizlik gerekmiyorsa sorun değil)
```

- [ ] **Step 3: Formda görünen hata mesajını doğrula (opsiyonel, zorlama senaryosu)**

DevTools Network sekmesinden bir forma ait isteği yakalayıp gövdesine whitelist dışı bir alan ekleyip tekrar gönder (veya geçici olarak bir formun input'una `maxLength` sınırını aşan/format dışı bir değer zorla yazdır) → formun genel "Bir hata oluştu, lütfen tekrar deneyin." mesajını gösterdiğini, sayfanın çökmediğini doğrula.
