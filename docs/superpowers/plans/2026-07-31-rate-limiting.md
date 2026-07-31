# Rate Limiting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `api/atolye-kayit.js`'e, aynı IP'nin 1 dakikada 5'ten fazla `workshop_registration`/`request_stock_notification` isteği atmasını engelleyen basit, in-memory bir rate limiting eklemek (`place_order` muaf).

**Architecture:** Saf bir `api/rateLimit.js` modülü, modül scope'unda bir `Map<ip, timestamp[]>` tutan sabit pencereli (fixed window) bir sayaç sağlar. `api/atolye-kayit.js`, method kontrolünden hemen sonra ve `validatePayload`'dan önce bu sayacı kontrol eder — `place_order` event'i hariç.

**Tech Stack:** Node.js (Vercel serverless function, ESM), `node:assert` (framework'süz self-check).

## Global Constraints

- Pencere: 1 dakika (`60_000` ms). Limit: aynı IP'den en fazla 5 istek (bkz. `docs/superpowers/specs/2026-07-31-rate-limiting-design.md`).
- Limit anahtarı: sadece IP (`x-forwarded-for` ilk değeri, yoksa `x-real-ip`, o da yoksa `"unknown"`).
- `event === "place_order"` olan istekler sayaca hiç girmez.
- Sayaç kontrolü `validatePayload`'dan ÖNCE çalışır — geçersiz payload'lar da sayılır (bypass'ı önlemek için).
- Limit aşılırsa: `429` + `{ error: "Çok fazla istek, lütfen biraz bekleyin." }`, webhook'a istek gitmez.
- Otomatik test framework'ü yok — `node:assert` ile framework'süz self-check (`node api/rateLimit.test.js`) yeterli, projenin geri kalanıyla tutarlı.
- Kod içinde in-memory sınırlamayı belirten bir `// ponytail:` yorumu bırakılır.
- `api/validatePayload.js`'e bu planda dokunulmuyor.

---

## Dosya Yapısı

- **Create:** `api/rateLimit.js` — `isRateLimited(key, now)` ve `getClientIp(req)` saf fonksiyonları.
- **Create:** `api/rateLimit.test.js` — `node:assert` self-check.
- **Modify:** `api/atolye-kayit.js` — handler'a rate limit kontrolü eklenir.

---

### Task 1: `api/rateLimit.js` — in-memory sabit pencereli rate limiter

**Files:**
- Create: `api/rateLimit.js`
- Test: `api/rateLimit.test.js`

**Interfaces:**
- Produces: `export function isRateLimited(key, now = Date.now())` → `boolean` (true = limitli). `export function getClientIp(req)` → `string`. Task 2 bu iki fonksiyonu import edip kullanacak.

- [ ] **Step 1: Test dosyasını yaz (self-check, henüz modül yok)**

`api/rateLimit.test.js` dosyasını oluştur:

```js
import assert from "node:assert";
import { isRateLimited, getClientIp } from "./rateLimit.js";

const WINDOW_MS = 60_000;

// Aynı key'e ardışık 5 çağrı: hepsi izinli
{
  const key = "1.2.3.4";
  const now = 1000000;
  for (let i = 0; i < 5; i++) {
    assert.strictEqual(isRateLimited(key, now), false, `${i + 1}. istek izinli olmalı`);
  }
}

// 6. istek: limitli
{
  const key = "1.2.3.5";
  const now = 2000000;
  for (let i = 0; i < 5; i++) {
    isRateLimited(key, now);
  }
  assert.strictEqual(isRateLimited(key, now), true, "6. istek limitli olmalı");
}

// Farklı key'in sayacı bağımsız
{
  const keyA = "10.0.0.1";
  const keyB = "10.0.0.2";
  const now = 3000000;
  for (let i = 0; i < 5; i++) {
    isRateLimited(keyA, now);
  }
  assert.strictEqual(isRateLimited(keyA, now), true, "keyA limitli olmalı");
  assert.strictEqual(isRateLimited(keyB, now), false, "keyB etkilenmemeli");
}

// Pencere geçince sayaç sıfırlanır
{
  const key = "10.0.0.3";
  const now = 4000000;
  for (let i = 0; i < 5; i++) {
    isRateLimited(key, now);
  }
  assert.strictEqual(isRateLimited(key, now), true, "pencere içinde limitli olmalı");
  assert.strictEqual(
    isRateLimited(key, now + WINDOW_MS + 1),
    false,
    "pencere geçtikten sonra tekrar izinli olmalı"
  );
}

// getClientIp: x-forwarded-for varsa ilk değeri alır
{
  const req = { headers: { "x-forwarded-for": "203.0.113.5, 70.41.3.18" } };
  assert.strictEqual(getClientIp(req), "203.0.113.5");
}

// getClientIp: x-forwarded-for yoksa x-real-ip'e düşer
{
  const req = { headers: { "x-real-ip": "198.51.100.7" } };
  assert.strictEqual(getClientIp(req), "198.51.100.7");
}

// getClientIp: hiçbiri yoksa "unknown"
{
  const req = { headers: {} };
  assert.strictEqual(getClientIp(req), "unknown");
}

console.log("Tüm rateLimit testleri geçti ✓");
```

- [ ] **Step 2: Testi çalıştırıp başarısız olduğunu doğrula**

Run: `node api/rateLimit.test.js`
Expected: `Cannot find module './rateLimit.js'` hatasıyla FAIL (dosya henüz yok).

- [ ] **Step 3: `api/rateLimit.js`'i yaz**

```js
// ponytail: in-memory rate limit, tek instance'a özel — Vercel soğuk
// başlangıcında/paralel instance'larda sıfırlanır, dağıtık olarak tam
// doğru değil. Trafik artarsa Supabase tablosu veya Redis'e taşı.
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

- [ ] **Step 4: Testi çalıştırıp geçtiğini doğrula**

Run: `node api/rateLimit.test.js`
Expected: `Tüm rateLimit testleri geçti ✓` yazdırılır, exit code 0.

- [ ] **Step 5: Commit**

```bash
git add api/rateLimit.js api/rateLimit.test.js
git commit -m "IP bazlı, sabit pencereli in-memory rate limiter ekle"
```

---

### Task 2: `api/atolye-kayit.js` — rate limit kontrolünü handler'a bağla

**Files:**
- Modify: `api/atolye-kayit.js:1-24` (tüm dosya)

**Interfaces:**
- Consumes: `isRateLimited(key, now)`, `getClientIp(req)` (Task 1).

- [ ] **Step 1: `api/atolye-kayit.js`'i yeniden yaz**

Dosyanın tamamını şu içerikle değiştir:

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

- [ ] **Step 2: Task 1'in testinin hâlâ geçtiğini doğrula**

Run: `node api/rateLimit.test.js` ve `node api/validatePayload.test.js`
Expected: İkisi de kendi başarı mesajını yazdırır, exit code 0 (bu görev onlara dokunmuyor, kontrol amaçlı).

- [ ] **Step 3: Commit**

```bash
git add api/atolye-kayit.js
git commit -m "atolye-kayit handler'ına IP bazlı rate limit kontrolünü bağla"
```

---

### Task 3: Uçtan uca manuel doğrulama

**Files:**
- Değişiklik yok — Task 1-2'nin birlikte doğru çalıştığını doğrular.

**Interfaces:**
- Consumes: Task 1-2'de tamamlanan `rateLimit`/`atolye-kayit` entegrasyonu.

Bu ortamda `vercel` CLI yok ve Vite dev server `/api/*`'ı proxy'lemiyor (önceki webhook-validation planında da aynı kısıt vardı) — bu yüzden handler, mocked `req`/`res`/`fetch` ile doğrudan çağrılarak doğrulanır (commit edilmeyen, tek seferlik bir Node script'iyle).

- [ ] **Step 1: Mocked script ile 429/muafiyet/reset davranışını doğrula**

Aşağıdaki script'i geçici bir dosyaya (örn. `/tmp/rate-limit-check.mjs`) yaz ve çalıştır:

```js
process.env.WEBHOOK_URL = "https://example.invalid/webhook";
let fetchCallCount = 0;
global.fetch = async () => {
  fetchCallCount++;
  return { status: 200 };
};

const { default: handler } = await import("<REPO_ROOT>/api/atolye-kayit.js");

function mockRes() {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (obj) => { res.body = obj; return res; };
  res.end = () => res;
  res.setHeader = () => {};
  return res;
}

function mockReq(body, ip) {
  return { method: "POST", body, headers: { "x-forwarded-for": ip } };
}

// Aynı IP'den 5 request_stock_notification: hepsi 200 (veya validation'a bağlı, ama 429 değil)
{
  fetchCallCount = 0;
  const ip = "9.9.9.1";
  for (let i = 0; i < 5; i++) {
    const res = mockRes();
    await handler(
      mockReq({ event: "request_stock_notification", name: "Test", productId: "x", productName: "y", email: "test@example.com" }, ip),
      res
    );
    console.log(`İstek ${i + 1}:`, res.statusCode);
  }
}

// 6. istek aynı IP: 429 olmalı
{
  const ip = "9.9.9.1";
  const res = mockRes();
  await handler(
    mockReq({ event: "request_stock_notification", name: "Test", productId: "x", productName: "y", email: "test@example.com" }, ip),
    res
  );
  console.log("6. istek (aynı IP):", res.statusCode, res.body);
}

// place_order muaf: aynı IP'den 6+ place_order isteği hiç 429 almamalı
{
  const ip = "9.9.9.1";
  for (let i = 0; i < 6; i++) {
    const res = mockRes();
    await handler(
      mockReq({ event: "place_order", name: "Test", productId: "x", productName: "y", quantity: 1 }, ip),
      res
    );
    console.log(`place_order isteği ${i + 1}:`, res.statusCode);
  }
}

// Farklı IP: kendi sayacıyla başlar, 429 almamalı
{
  const ip = "9.9.9.2";
  const res = mockRes();
  await handler(
    mockReq({ event: "request_stock_notification", name: "Test", productId: "x", productName: "y", email: "test@example.com" }, ip),
    res
  );
  console.log("Farklı IP:", res.statusCode);
}

console.log("Toplam fetch çağrısı:", fetchCallCount);
```

`<REPO_ROOT>` yerine repo'nun gerçek mutlak yolunu yaz. Çalıştır: `node /tmp/rate-limit-check.mjs`

Expected çıktı:
- İlk 5 `request_stock_notification` isteği: `200` (webhook mock'una gerçekten gidiyor).
- 6. istek (aynı IP): `429` ve `{ error: "Çok fazla istek, lütfen biraz bekleyin." }`.
- 6 `place_order` isteğinin hepsi: `200` (hiçbiri 429 almıyor — muafiyet çalışıyor).
- Farklı IP'nin isteği: `200` (kendi sayacı, önceki IP'den etkilenmiyor).

- [ ] **Step 2: Geçici script'i sil**

```bash
rm /tmp/rate-limit-check.mjs
```

- [ ] **Step 3: `npm run build` ile derlemenin bozulmadığını doğrula**

Run: `npm run build`
Expected: Hatasız tamamlanır (bu değişiklik sadece `api/` altında, ama regresyon olmadığını doğrulamak için çalıştır).
