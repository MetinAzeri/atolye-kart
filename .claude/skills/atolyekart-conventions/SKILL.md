---
name: atolyekart-conventions
description: Use when creating, modifying, or reviewing AtölyeKart components, ürün/kategori verisi, routing/sayfa yapısı, sepet/üyelik state'i, görsel ekleme akışını, or webhook entegrasyonlarını — bileşen yapısı kurallarını, veri dosyası konumlarını, global state'i ve webhook veri sözleşmesini tanımlar.
---

# AtölyeKart Konvansiyonları

## Overview

AtölyeKart, build adımı olmayan, native ES modules + React (CDN üzerinden `esm.sh`) ile yazılmış çok sayfalı bir React projesi (bkz. `index.html`, `src/main.js`). Babel/JSX kullanmaz, bileşenler ayrı dosyalara bölünmüştür. Bu skill; bileşen kuralları, veri dosyası konumu, routing, global state, görsel ekleme akışı ve webhook veri sözleşmesini sabitler.

## Bileşen Kuralları

- **Fonksiyon bileşeni**: Her bileşen bir fonksiyon olarak tanımlanır, class component kullanılmaz.
- **Native ES modules, build aracı yok**: React/ReactDOM `esm.sh` üzerinden `import` edilir (`import React from "https://esm.sh/react@18"`). JSX/Babel kullanılmaz — tüm bileşenler **JSX yerine `React.createElement`** ile yazılır.
- **Her bileşen ayrı dosyada**: `src/components/` altında, dosya adı bileşen adıyla birebir aynı (`ProductCard.js` → `ProductCard`).

Mevcut desen (`src/components/ProductImage.js`):

```js
import React from "https://esm.sh/react@18";

const { useState } = React;

export function ProductImage({ images }) {
  const [index, setIndex] = useState(0);

  return React.createElement(
    "div",
    {
      className: "product-image",
      onMouseEnter: () => setIndex(1),
      onMouseLeave: () => setIndex(0),
      onClick: () => setIndex((current) => (current === 0 ? 1 : 0)),
    },
    images.map((src, i) =>
      React.createElement("img", {
        key: src,
        className: "product-image-photo",
        style: { opacity: i === index ? 1 : 0 },
        src,
        alt: "",
      })
    )
  );
}
```

Yeni bir bileşen eklerken bu üç kurala uy: fonksiyon olarak tanımla, `React.createElement` kullan, `src/components/` altında kendi dosyasına koy.

## Veri Konumu

- **Ürün verisi**: `src/data/products.js` — `export const products = [...]`. Şema: `{ id, name, price (number), description, categoryId, stockStatus ("in_stock"|"low_stock"|"out_of_stock"), stockQuantity? (opsiyonel), images: [url1, url2] }` — `images`, `assets/products/` altındaki kırpılmış fotoğraflara işaret eden düz bir string dizisi (2 kare).
- **Kategori verisi**: `src/data/categories.js` — `export const categories = [...]`. Şema: `{ id, label, color }`.
- **Atölye verisi**: `src/data/workshops.js` — haftalık gün kurallarından (`dayOfWeek` + tür) `new Date()`'e göre türetilmiş, ~90 gün ileriye kadar somut tarihli bir dizi üretir; literal tarih hardcode edilmez.

Bileşenler veriyi doğrudan import eder; veri bileşenlerden bağımsız kalır, yeni ürün/kategori eklemek bileşen kodunu değiştirmeyi gerektirmez.

## Sayfalar / Routing

`react-router-dom` `HashRouter` kullanılır (statik host'ta sunucu taraf yönlendirme gerekmediği için) — URL'ler `/#/...` formatında. Route'lar `src/main.js`'te tanımlı:

| Route | Sayfa bileşeni |
|---|---|
| `/` | `src/pages/HomePage.js` |
| `/urunler` | `src/pages/ProductsPage.js` |
| `/kendin-tasarla` | `src/pages/DesignPage.js` |
| `/atolyeler` | `src/pages/WorkshopsPage.js` |
| `/biz-kimiz` | `src/pages/AboutPage.js` |
| `/sepet` | `src/pages/CartPage.js` |

`Navbar`/`Toast`/`Footer` her route'ta sabit render edilir.

## Global State

- **`src/context/CartContext.js`** (`useCart()`): sepet satırları (`{ productId, price, quantity, name, custom? }`), `addItem`/`incrementItem`/`decrementItem`/`clearCart`, `totalCount`/`totalPrice`/`toast`. Kalıcı değil (localStorage yok), sayfa yenilenince sıfırlanır.
- **`src/context/AuthContext.js`** (`useAuth()`): gerçek Supabase Auth (`src/supabaseClient.js`, e-posta+şifre) — `login(email, password)` / `signup(email, password, username)` async'tir, hatalı girişte throw eder. Session Supabase'in `persistSession` (localStorage) davranışıyla kalıcıdır. `loading` alanı ilk session kontrolü bitene kadar `true`. Giriş yapılmışsa `CheckoutForm.js` iletişim adımını atlayıp doğrudan ödemeye geçer (bkz. Webhook bölümü).

## Görsel Ekleme Akışı

Yeni görseller önce `assets/raw/` içine bırakılır (farklı formatlarda/isimlerde gelebilir — `.png`/`.webp`/`.jpeg`, dosya adında yazım hatası olabilir). Uygulama adımı: PIL ile gerekiyorsa kırp (ör. kolaj/tek parça görsel), `.jpg`'ye standardize et, konuya özel bir klasöre taşı (`assets/products/`, `assets/about/`, `assets/ceramic-art/`, `assets/family/` gibi — kebab-case, tek görsel ise `assets/hero.jpg` gibi düz dosya), ardından `assets/raw/`'daki orijinali sil. Kod içinde her zaman standardize edilmiş `.jpg` yola referans verilir, `assets/raw/`'a değil.

## Webhook Veri Sözleşmesi

Üç event tipi: `place_order`, `request_stock_notification` ve `workshop_registration`. Uygulama: `src/lib/webhook.js` (`WEBHOOK_URL` + `sendWebhookEvent(payload)`). Tüm alan adları **camelCase**.

### Sipariş Ver → `place_order`

Gönderim noktası: `src/components/CheckoutForm.js`, sepetteki **her satır için ayrı istek**, `PaymentForm.js`'in "Ödemeyi Onayla" adımı **onaylandığı an** (sahte ~1.5sn gecikme sonrası) tetiklenir — `PaymentForm`'daki kart numarası/isim/son kullanma/CVV alanları **hiçbir zaman** bu payload'a (veya başka bir yere) dahil edilmez, sadece görsel/local kalır.

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

Kullanıcı giriş yapmışsa (`AuthContext`), iletişim formu atlanır: `name` alanına `user.username` yazılır, `phone`/`email` alanları **hiç gönderilmez** (payload'da anahtarları bile yer almaz).

### Stok Bildirimi İste → `request_stock_notification`

Gönderim noktası: `src/components/StockNotifyForm.js`, ürün kartındaki "Stok Bildirimi İste" formunun gönderilme anı.

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

Gönderim noktası: `src/components/RegistrationForm.js`, `WorkshopDetail.js`'teki "Katıl" formunun gönderilme anı.

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

`workshopDate`/`workshopType`, seçilen atölye objesinden (`src/data/workshops.js`) alınır.

## Quick Reference

| Konu | Kural |
|---|---|
| Bileşen | Fonksiyon bileşeni, `React.createElement`, `src/components/` altında ayrı dosya |
| Ürün verisi | `src/data/products.js`, `export const products`, `images: [url1, url2]` |
| Kategori verisi | `src/data/categories.js`, `export const categories` |
| Atölye verisi | `src/data/workshops.js`, kural bazlı türetilmiş (hardcode tarih yok) |
| Routing | `HashRouter`, route'lar `src/main.js`'te (`/`, `/urunler`, `/kendin-tasarla`, `/atolyeler`, `/biz-kimiz`, `/sepet`) |
| Sepet state | `CartContext` / `useCart()`, kalıcı değil |
| Üyelik | `AuthContext` / `useAuth()`, gerçek Supabase Auth (e-posta+şifre), session kalıcı |
| Görsel ekleme | `assets/raw/` → kırp/standardize et (`.jpg`) → `assets/<konu>/` → raw'ı sil |
| Webhook — Sipariş Ver | `event: "place_order"`, ödeme onayında (`CheckoutForm`); giriş yapılmışsa `phone`/`email` yok |
| Webhook — Stok Bildirimi İste | `event: "request_stock_notification"` (`StockNotifyForm`) |
| Webhook — Atölye Kaydı | `event: "workshop_registration"` (`RegistrationForm`) |
| Sahte ödeme | `PaymentForm.js` — kart bilgisi hiçbir zaman webhook'a veya başka bir yere gönderilmez |
| İsimlendirme | camelCase |
