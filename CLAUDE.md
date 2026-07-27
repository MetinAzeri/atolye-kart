Canlı site: GitHub Pages üzerinden yayınlanıyor — https://metinazeri.github.io/atolye-kart/. main branch'e push edilen her değişiklik otomatik yayına yansır.

## Mimari

Build aracı yok — native ES modules + React (`esm.sh` CDN, `index.html`'deki importmap üzerinden). Bileşenler `React.createElement` ile yazılır, JSX/Babel yok.

**Routing**: `react-router-dom` (`HashRouter`, statik host'ta sunucu taraf yönlendirme gerekmediği için) — URL'ler `/#/...` formatında.

- `/` — Ana Sayfa (`src/pages/HomePage.js`): hero (üzerine bindirilmiş başlık/slogan), güven şeridi, Seramik Sanatı bölümü, öne çıkan ürünler, Kendin Tasarla CTA'sı
- `/urunler` — Ürünler (`src/pages/ProductsPage.js`): tüm ürün listesi
- `/kendin-tasarla` — Kendin Tasarla (`src/pages/DesignPage.js`): özel tasarım konfigüratörü
- `/biz-kimiz` — Biz Kimiz (`src/pages/AboutPage.js`)
- `/sepet` — Sepet (`src/pages/CartPage.js`): sepet satırları + "Siparişi Tamamla"

`src/components/Navbar.js` tüm route'ların üstünde, `src/components/Footer.js` (QR + telif) altında sabit render edilir.

**Sepet state**: `src/context/CartContext.js` (React Context) — satır başına id/adet/fiyat/isim (özel tasarımlarda ek olarak `custom` açıklayıcısı) tutar; `addItem`/`incrementItem`/`decrementItem`/`clearCart` metodlarını ve `totalCount`/`totalPrice`/`toast` değerlerini sağlar. `useCart()` hook'uyla erişilir; kalıcılık (localStorage) yok. Sepete ekleme, `src/components/Toast.js` ile kısa süreli bir bildirim tetikler.

**Kendin Tasarla akışı**: `DesignPage.js`, 4 adımlı bir stepper yönetir (Ürün → Renk → Desen → Yazı; `currentStep` + seçim state'i component-local). Seçilen her kombinasyon `src/components/CeramicPreview.js`'e prop olarak geçirilir — bu bileşen `type`'a göre (tabak/bardak/tepsi/vazo) gradyanlı/gölgeli, dolgu tabanlı bir SVG çizer; desen varsa `clipPath` ile forma klipslenir, rengi `src/lib/color.js`'teki `shadeColor`/`getLuminance` ile seçilen renkten otomatik hesaplanır. "Sepete Ekle"de sentetik bir ürün nesnesi (`id`, `name: "Özel Tasarım — …"`, sabit `price`, `custom` açıklayıcısı) `addItem`'a geçirilir; `CartPage` bu satırlarda küçük bir `CeramicPreview` gösterir.

**Sipariş akışı**: `src/components/CheckoutForm.js`, sepetteki her satır için `src/lib/webhook.js`'teki `sendWebhookEvent` ile ayrı bir `place_order` isteği gönderir (bkz. `.claude/skills/atolyekart-conventions` webhook sözleşmesi; özel tasarımlarda `productName` olarak `item.name` kullanılır). Stok bildirimi (`StockNotifyForm.js`) ayrı ve değişmeden çalışır.

## Ana Bileşenler

- `Navbar`, `Footer` — site geneli çerçeve
- `ProductCard`, `ProductImage`, `ProductList` — katalog ürün gösterimi
- `AboutSection`, `CeramicArtSection` — Biz Kimiz / Ana Sayfa anlatı bölümleri
- `CeramicPreview`, `DesignPage` — Kendin Tasarla konfigüratörü ve SVG önizleme
- `CheckoutForm`, `StockNotifyForm`, `Toast`, `QrCode` — sepet/bildirim yardımcı bileşenleri
