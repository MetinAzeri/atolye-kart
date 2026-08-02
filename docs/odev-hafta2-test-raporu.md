# Hafta 2 Ödevi — Test ve Doğrulama Raporu

**Tarih:** 2026-08-01 23:47 (+03)
**Commit:** `d8aeb7c`
**Test edilen ortam:** https://atolye-kart.vercel.app (canlı Vercel deployment)

---

## 1. Secret Yönetimi

### 1.1 `.env` ve `mobile/.env` gitignore ile korunuyor mu?

```
$ git check-ignore -v .env
.gitignore:4:.env	.env

$ git check-ignore -v mobile/.env
mobile/.gitignore:34:.env	mobile/.env
```

Her iki komut da eşleşen ignore kuralını bulup 0 exit code ile döndü → **her iki dosya da ignore ediliyor.**

### 1.2 Repo'da takip edilen env dosyaları

```
$ git ls-files | grep -i env
.env.example
mobile/.env.example
```

Sadece `.env.example` ve `mobile/.env.example` takip ediliyor (placeholder değerli şablon dosyalar). Gerçek `.env`/`mobile/.env` repo'da yok. ✅

### 1.3 `.env` geçmişte hiç commit edilmiş mi?

```
$ git log --all --full-history -- .env
(boş çıktı)

$ git log --all --full-history -- mobile/.env
(boş çıktı)
```

Tüm branch'ler ve tüm geçmiş taranarak (`--all --full-history`) hiçbir commit'te `.env` veya `mobile/.env` bulunamadı. ✅

### 1.4 Webhook URL'i tarayıcı koduna sızıyor mu?

`.env.example` içeriği:
```
WEBHOOK_URL=degistir-buraya
```

`WEBHOOK_URL` sadece sunucu tarafında (`api/atolye-kayit.js`) `process.env.WEBHOOK_URL` olarak okunuyor:
```
$ grep -rn "WEBHOOK\|webhook" api/
api/atolye-kayit.js:21:    const response = await fetch(process.env.WEBHOOK_URL, {
```

`src/` (tarayıcıya giden kod) içinde `webhook` araması:
```
$ grep -rni "webhook" src/
src/components/RegistrationForm.js:3:import { sendWebhookEvent } from "../lib/webhook.js";
src/components/CheckoutForm.js:3:import { sendWebhookEvent } from "../lib/webhook.js";
src/components/StockNotifyForm.js:3:import { sendWebhookEvent } from "../lib/webhook.js";
src/lib/webhook.js:1:export async function sendWebhookEvent(payload) {
```

`src/lib/webhook.js` içeriği — tarayıcı sadece kendi origin'indeki `/api/atolye-kayit` adresine POST atıyor, gerçek webhook hedefi (n8n vb.) hiç görünmüyor:
```js
export async function sendWebhookEvent(payload) {
  const response = await fetch("/api/atolye-kayit", { ... });
  ...
}
```

Ek olarak `src/` içinde tüm harici URL'ler tarandı:
```
$ grep -rn "https\?://" src/
src/components/Footer.js:5:const SITE_URL = "https://metinazeri.github.io/atolye-kart/#/";
```

Tek sonuç site'nin kendi public URL'i — gerçek webhook domain'i (env değişkeninden gelen değer) **tarayıcı koduna hiç sızmıyor**. ✅

---

## 2. Sunucu Tarafı Validasyon

Kaynak: `api/validatePayload.js` — her event tipi için (`place_order`, `request_stock_notification`, `workshop_registration`) zorunlu/opsiyonel alan şeması ve regex bazlı format kontrolü var.

### 2.1 Eksik alanlı istek

```
$ curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST https://atolye-kart.vercel.app/api/atolye-kayit \
  -H "Content-Type: application/json" \
  -d '{"event":"workshop_registration","name":"Test Kullanici","email":"test@example.com","participantCount":1,"workshopDate":"2026-08-10","workshopType":"Buyukler"}'

{"error":"Eksik alan: phone"}
HTTP_STATUS:400
```

`phone` alanı eksik bırakıldı → sunucu `400 Bad Request` ile hangi alanın eksik olduğunu belirtti. ✅

### 2.2 Geçersiz e-posta formatı

```
$ curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST https://atolye-kart.vercel.app/api/atolye-kayit \
  -H "Content-Type: application/json" \
  -d '{"event":"workshop_registration","name":"Test Kullanici","phone":"5551234567","email":"gecersiz-email","participantCount":1,"workshopDate":"2026-08-10","workshopType":"Buyukler"}'

{"error":"Geçersiz alan: email"}
HTTP_STATUS:400
```

`email: "gecersiz-email"` regex'e uymuyor → `400 Bad Request`. ✅

### 2.3 Geçerli istek

İlk denemeler (bkz. Bölüm 3) test IP'sinin rate limit sınırına ulaşmasına yol açtı; bu yüzden rate limit'ten muaf olan `place_order` event'i ile tekrar denendi (kod: `isRateLimited` kontrolü `event !== "place_order"` şartına bağlı, bkz. `api/atolye-kayit.js:10`):

```
$ curl -s -i -X POST https://atolye-kart.vercel.app/api/atolye-kayit \
  -H "Content-Type: application/json" \
  -d '{"event":"place_order","name":"Odev Hafta2 Test Siparis","productId":"test-urun-1","productName":"Test Seramik Tabak","quantity":1}'

HTTP/2 429
content-length: 0
```

Bu istek de `429` ile karşılandı — ancak boş body ve `content-type`/`etag` header'larının eksikliği, bunun uygulama kodundaki (`api/rateLimit.js`) limitten değil, **Vercel platformunun kendi edge/abuse-koruma katmanından** geldiğini gösteriyor (uygulama limiti `place_order`'ı hiç saymıyor, dolayısıyla uygulama kodu bu isteği reddetmiş olamaz — ayrıntı Bölüm 3'te). Bu oturumda yoğun test trafiği nedeniyle test IP'si geçici olarak bu platform seviyesinde de sınırlandı; **temiz bir `200`/başarılı yanıt bu oturumda yakalanamadı.**

Doğrulama koda dayanarak yapıldı: gönderilen payload, `place_order` şeması (`required: ["name","productId","productName","quantity"]`) ile tam uyumlu — `validatePayload.js` bu payload için `{valid: true, ...}` döndürecek şekilde yazılmış (satır satır incelendi, bkz. `api/validatePayload.js:5-9`, `35-73`). **Öneri:** Bu testi bir dakika+ soğuma sonrası veya farklı bir ağdan tekrarlayarak temiz `200` yanıtı ayrıca yakalanabilir.

---

## 3. Rate Limiting

Kaynak: `api/rateLimit.js`
```js
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
```
Spesifikasyon: **IP başına 60 saniyede en fazla 5 istek** (`place_order` event'i hariç — bkz. `api/atolye-kayit.js:10`).

### 3.1 Gözlemlenen 429 yanıtları (uygulama seviyesi)

Test sırasında `workshop_registration` event'i ile art arda istekler atıldığında, uygulamanın kendi rate limit mesajıyla `429` alındı:

```
$ curl -s -i -X POST https://atolye-kart.vercel.app/api/atolye-kayit \
  -H "Content-Type: application/json" \
  -d '{"event":"workshop_registration", ...}'

HTTP/2 429
content-type: application/json; charset=utf-8
content-length: 53
etag: W/"35-PSY9Ki2zP5RdbAlEjx69624N9Jo"

{"error":"Çok fazla istek, lütfen biraz bekleyin."}
```

Bu, `api/atolye-kayit.js:11-13`'teki uygulama kodunun ürettiği yanıtla birebir eşleşiyor (JSON body, doğru content-type, kodun kendi mesajı) → **rate limit mekanizması canlıda çalışıyor.** ✅

### 3.2 Tam olarak kaçıncı istekte tetiklendiği — dürüst not

Bölüm 2.1 ve 2.2'deki iki test isteği zaten sayaca dahil oldu (rate limit kontrolü, `event !== "place_order"` olan her istekte, payload geçerli olsun olmasın devreye giriyor — bkz. `api/atolye-kayit.js:10-13`, doğrulamadan *önce* çalışıyor). Bunu takip eden 3. istekte (Bölüm 2.3'teki ilk "geçerli istek" denemesi) beklenenden erken `429` alındı; bu, test IP'sinin bu canlı/paylaşımlı endpoint'te önceki (bu oturumdan önceki) trafikten kalan bir sayaç durumuna sahip olabileceğini gösteriyor.

Kesin sınırı izole etmek için pencerenin temizlenmesi beklenip (65sn, sonra 90sn, sonra 60sn — toplam ~4 dakika) 6-7 istekten oluşan kontrollü seriler tekrar denendi. Ancak bu yoğun tekrar denemeler sonucunda test IP'si, uygulama limitinin ötesinde **Vercel'in kendi platform seviyesi koruma katmanına** da takıldı (content-length:0, content-type/etag yok — bu, `place_order` gibi uygulama limitinden muaf event'lerde bile 429 alınmasıyla doğrulandı, bkz. 2.3). Bu iki katman iç içe geçtiği için, bu oturumda "tam olarak N. istekte tetiklendi" şeklinde temiz bir sayaç gösterimi **elde edilemedi** — uydurmamak adına bu açıkça belirtiliyor.

**Kod düzeyinde kesin spesifikasyon** (`api/rateLimit.js:3-4`): limit **5 istek / 60 saniye / IP**, 6. istekte `429` bekleniyor. Bölüm 3.1'deki gerçek `429` yanıtı, bu mekanizmanın production'da aktif ve doğru mesajla çalıştığını kanıtlıyor; sadece bu oturumdaki yoğun test trafiği yüzünden "tam sınır" anı net biçimde yakalanamadı.

**⏳ Bekleme notu:** Bu bölümdeki testler nedeniyle test IP'si hem uygulama hem de olası platform seviyesinde geçici olarak sınırlanmış olabilir. Rapor sonrası ek canlı test yapılacaksa **en az 1 dakika** (tercihen birkaç dakika) beklenmesi önerilir.

---

## 4. Mobil Port Doğrulama

Çalışma dizini: `mobile/`

### 4.1 `npx expo-doctor`

```
$ npx expo-doctor
Running 18 checks on your project...
18/18 checks passed. No issues detected!
```
✅ Tüm kontroller geçti.

### 4.2 `npx tsc --noEmit`

```
$ npx tsc --noEmit
(çıktı yok)
exit: 0
```
✅ Tip hatası yok.

### 4.3 `npx expo export --platform ios`

```
$ npx expo export --platform ios
...
iOS Bundled 10839ms node_modules/expo-router/entry.js (1629 modules)
› Assets (42):
...
› ios bundles (1):
_expo/static/js/ios/entry-cd2a0b36ee4df0701ec140ee1ddbb486.hbc (5.06 MB)
› Files (1):
metadata.json (2.98 kB)
Exported: dist
exit: 0
```
✅ **1629 modül** başarıyla bundle edildi, export `dist/` altına başarıyla tamamlandı (test sonrası `dist/` temizlendi, repo'ya dahil edilmedi).

### 4.4 `git status` — web tarafının (`src/`, `api/`, `vercel.json`) değişmediği teyidi

```
$ git status
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean

$ git status src/ api/ vercel.json --porcelain
(boş çıktı)
```
✅ Mobil port çalışması sırasında `src/`, `api/`, `vercel.json` hiç değişmedi — web tarafı build aracı/deployment akışı etkilenmedi.

---

## Özet

| Bölüm | Sonuç |
|---|---|
| 1. Secret Yönetimi | ✅ `.env` dosyaları ignore ediliyor, hiç commit edilmemiş, webhook URL'i tarayıcı koduna sızmıyor |
| 2. Sunucu Tarafı Validasyon | ✅ Eksik alan ve geçersiz e-posta doğru reddediliyor; geçerli istek kod incelemesiyle doğrulandı, canlı `200` bu oturumda rate limit nedeniyle yakalanamadı |
| 3. Rate Limiting | ✅ Mekanizma production'da aktif ve doğru mesajla çalışıyor (kod spesifikasyonu: 5 istek/60sn/IP); bu oturumda tam sınır anı, önceki/eşzamanlı trafik ve platform seviyesi koruma nedeniyle net izole edilemedi |
| 4. Mobil Port | ✅ `expo-doctor` 18/18, `tsc` temiz, `expo export` 1629 modül, web tarafı dosyaları (`src/`, `api/`, `vercel.json`) değişmedi |
