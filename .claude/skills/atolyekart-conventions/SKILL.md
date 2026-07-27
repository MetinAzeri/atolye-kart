---
name: atolyekart-conventions
description: Use when creating, modifying, or reviewing AtölyeKart components, ürün/kategori verisi, or "Sipariş Ver"/"Stok Bildirimi İste" webhook entegrasyonlarını — bileşen yapısı kurallarını, veri dosyası konumlarını ve webhook veri sözleşmesini tanımlar.
---

# AtölyeKart Konvansiyonları

## Overview

AtölyeKart, build adımı olmayan, native ES modules + React (CDN üzerinden `esm.sh`) ile yazılmış bir React projesi (bkz. `index.html`, `src/main.js`). BizCard'ın React sürümünden farklı olarak Babel/JSX kullanmaz ve bileşenler ayrı dosyalara bölünmüştür. Bu skill üç konvansiyonu sabitler: bileşen kuralları, veri dosyası konumu, webhook veri sözleşmesi.

## Bileşen Kuralları

- **Fonksiyon bileşeni**: Her bileşen bir fonksiyon olarak tanımlanır, class component kullanılmaz.
- **Native ES modules, build aracı yok**: React/ReactDOM `esm.sh` üzerinden `import` edilir (`import React from "https://esm.sh/react@18"`). JSX/Babel kullanılmaz — tarayıcı `import` ile çekilen ayrı `.js` dosyalarını transpile edecek bir araç çalıştırmadığı için, tüm bileşenler **JSX yerine `React.createElement`** ile yazılır.
- **Her bileşen ayrı dosyada**: `src/components/` altında, dosya adı bileşen adıyla birebir aynı (`ProductCard.js` → `ProductCard`).

Mevcut desen (`src/components/ProductImage.js`):

```js
import React from "https://esm.sh/react@18";

export function ProductImage({ image }) {
  if (image.type === "photo") {
    return React.createElement("img", { className: "product-image", src: image.url, alt: "" });
  }
  return React.createElement("div", {
    className: "product-image",
    style: { backgroundColor: image.color },
  });
}
```

Yeni bir bileşen eklerken bu üç kurala uy: fonksiyon olarak tanımla, `React.createElement` kullan, `src/components/` altında kendi dosyasına koy.

## Veri Konumu

- **Ürün verisi**: `src/data/products.js` — `export const products = [...]`. Şema: `{ id, name, price (number), description, categoryId, stockStatus ("in_stock"|"low_stock"|"out_of_stock"), stockQuantity? (opsiyonel), image: { type: "placeholder"|"photo", color?, url? } }`.
- **Kategori verisi**: `src/data/categories.js` — `export const categories = [...]`. Şema: `{ id, label, color }`.

Bileşenler veriyi doğrudan import eder (`import { products } from "../data/products.js"`); veri bileşenlerden bağımsız kalır, yeni ürün/kategori eklemek bileşen kodunu değiştirmeyi gerektirmez.

## Webhook Veri Sözleşmesi

Üç event tipi: `place_order`, `request_stock_notification` ve `workshop_registration`. Uygulama: `src/lib/webhook.js` (`WEBHOOK_URL` + `sendWebhookEvent(payload)`). Tüm alan adları **camelCase**.

### Sipariş Ver → `place_order`

```json
{
  "event": "place_order",
  "name": "Ayşe Yılmaz",
  "productId": "nar-cicegi-kase",
  "productName": "Nar Çiçeği Kase",
  "phone": "+905XXXXXXXXX",
  "email": "ayse@example.com",
  "quantity": 2,
  "source": "atolyekart"
}
```

### Stok Bildirimi İste → `request_stock_notification`

```json
{
  "event": "request_stock_notification",
  "name": "Ayşe Yılmaz",
  "productId": "silindir-vazo",
  "productName": "Silindir Vazo",
  "email": "ayse@example.com",
  "source": "atolyekart"
}
```

`productId`/`productName`, gönderilen `product` objesinden (`src/data/products.js`) alınır — üründen bağımsız uydurma değer geçirilmez.

### Atölyeler → `workshop_registration`

```json
{
  "event": "workshop_registration",
  "name": "Ayşe Yılmaz",
  "phone": "+905XXXXXXXXX",
  "email": "ayse@example.com",
  "participantCount": 2,
  "workshopDate": "2026-08-04",
  "workshopType": "Baba-Çocuk",
  "source": "atolyekart"
}
```

`workshopDate`/`workshopType`, seçilen atölye objesinden (`src/data/workshops.js`) alınır. Uygulama: `src/components/RegistrationForm.js`, `src/components/WorkshopDetail.js` içinden "Katıl" ile açılır.

## Quick Reference

| Konu | Kural |
|---|---|
| Bileşen | Fonksiyon bileşeni, `React.createElement`, `src/components/` altında ayrı dosya |
| Ürün verisi | `src/data/products.js`, `export const products` |
| Kategori verisi | `src/data/categories.js`, `export const categories` |
| Webhook — Sipariş Ver | `event: "place_order"` + `name`, `productId`, `productName`, `phone`, `email`, `quantity`, `source` |
| Webhook — Stok Bildirimi İste | `event: "request_stock_notification"` + `name`, `productId`, `productName`, `email`, `source` |
| Webhook — Atölye Kaydı | `event: "workshop_registration"` + `name`, `phone`, `email`, `participantCount`, `workshopDate`, `workshopType`, `source` |
| İsimlendirme | camelCase |
