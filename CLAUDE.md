Canlı site: GitHub Pages üzerinden yayınlanıyor — https://metinazeri.github.io/atolye-kart/. main branch'e push edilen her değişiklik otomatik yayına yansır.

## Mimari

Build aracı yok — native ES modules + React (`esm.sh` CDN, `index.html`'deki importmap üzerinden). Bileşenler `React.createElement` ile yazılır, JSX/Babel yok.

**Routing**: `react-router-dom` (`HashRouter`, statik host'ta sunucu taraf yönlendirme gerekmediği için) — URL'ler `/#/...` formatında.

- `/` — Ana Sayfa (`src/pages/HomePage.js`): logo/slogan/QR, hero, öne çıkan ürünler, Biz Kimiz teaser
- `/urunler` — Ürünler (`src/pages/ProductsPage.js`): tüm ürün listesi
- `/biz-kimiz` — Biz Kimiz (`src/pages/AboutPage.js`)
- `/sepet` — Sepet (`src/pages/CartPage.js`): sepet satırları + "Siparişi Tamamla"

`src/components/Navbar.js`, tüm route'ların üstünde sabit render edilir.

**Sepet state**: `src/context/CartContext.js` (React Context) — ürün id/adet/fiyat tutar, `addItem`/`incrementItem`/`decrementItem`/`clearCart` metodlarını ve `totalCount`/`totalPrice`/`toast` değerlerini sağlar. `useCart()` hook'uyla erişilir; kalıcılık (localStorage) yok. Sepete ekleme, `src/components/Toast.js` ile kısa süreli bir bildirim tetikler.

**Sipariş akışı**: `src/components/CheckoutForm.js`, sepetteki her satır için `src/lib/webhook.js`'teki `sendWebhookEvent` ile ayrı bir `place_order` isteği gönderir (bkz. `.claude/skills/atolyekart-conventions` webhook sözleşmesi). Stok bildirimi (`StockNotifyForm.js`) ayrı ve değişmeden çalışır.
