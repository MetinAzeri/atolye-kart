Canlı site: GitHub Pages üzerinden yayınlanıyor — https://metinazeri.github.io/atolye-kart/. main branch'e push edilen her değişiklik otomatik yayına yansır.

## Mimari

Build aracı yok — native ES modules + React (`esm.sh` CDN, `index.html`'deki importmap üzerinden). Bileşenler `React.createElement` ile yazılır, JSX/Babel yok.

**Routing**: `react-router-dom` (`HashRouter`, statik host'ta sunucu taraf yönlendirme gerekmediği için) — URL'ler `/#/...` formatında.

- `/` — Ana Sayfa (`src/pages/HomePage.js`): hero (üzerine bindirilmiş başlık/slogan), güven şeridi, Seramik Sanatı bölümü, öne çıkan ürünler, Kendin Tasarla CTA'sı
- `/urunler` — Ürünler (`src/pages/ProductsPage.js`): tüm ürün listesi
- `/kendin-tasarla` — Kendin Tasarla (`src/pages/DesignPage.js`): özel tasarım konfigüratörü
- `/atolyeler` — Atölyeler (`src/pages/WorkshopsPage.js`): aylık takvim + kayıt formu
- `/biz-kimiz` — Biz Kimiz (`src/pages/AboutPage.js`)
- `/sepet` — Sepet (`src/pages/CartPage.js`): sepet satırları + "Siparişi Tamamla" (ödeme simülasyonu dahil)

`src/components/Navbar.js` tüm route'ların üstünde, `src/components/Footer.js` (QR + telif) altında sabit render edilir. Navbar masaüstünde (≥720px) yatay menü, mobilde (≤720px) tek satır logo+sepet+hamburger (☰) ve hamburger'a basınca açılan dikey bir panel (nav linkleri + hesap kontrolü) olarak render edilir — hesap kontrolü (`accountBlock`) masaüstü ve mobil panelde aynı state'i paylaşan tek bir JSX parçası, iki yerde kullanılıyor.

**Sepet state**: `src/context/CartContext.js` (React Context) — satır başına id/adet/fiyat/isim (özel tasarımlarda ek olarak `custom` açıklayıcısı) tutar; `addItem`/`incrementItem`/`decrementItem`/`clearCart` metodlarını ve `totalCount`/`totalPrice`/`toast` değerlerini sağlar. `useCart()` hook'uyla erişilir; kalıcılık (localStorage) yok. Sepete ekleme, `src/components/Toast.js` ile kısa süreli bir bildirim tetikler.

**Üyelik**: `src/context/AuthContext.js` (`useAuth()`) gerçek Supabase Auth'u sarar (`src/supabaseClient.js`, e-posta+şifre ile `supabase.auth`). `login(email, password)` ve `signup(email, password, username)` async'tir ve hatalı girişte throw eder — `LoginForm.js` bunu yakalayıp Türkçeleştirilmiş bir hata mesajı gösterir. Session Supabase'in kendi `persistSession` (localStorage) davranışıyla kalıcıdır — sayfa yenilenince kullanıcı giriş yapılmış kalır. `useAuth()` ayrıca `loading` alanı sağlar (ilk session kontrolü tamamlanana kadar `true` — `Navbar.js` bunu flicker'ı önlemek için kullanır). `LoginForm.js`, `Navbar.js` içinden (masaüstünde dropdown, mobilde hamburger panelinin içinde) açılır. Giriş yapılmışsa `CheckoutForm.js` iletişim adımını atlayıp doğrudan ödemeye geçer; webhook payload'unda `name` olarak `user.username` kullanılır, `phone`/`email` alanları hiç gönderilmez.

**Kendin Tasarla akışı**: `DesignPage.js`, 4 adımlı bir stepper yönetir (Ürün → Renk → Desen → Yazı; `currentStep` + seçim state'i component-local). Seçilen her kombinasyon `src/components/CeramicPreview.js`'e prop olarak geçirilir — bu bileşen `type`'a göre (tabak/bardak/tepsi/vazo) gradyanlı/gölgeli, dolgu tabanlı bir SVG çizer; desen varsa `clipPath` ile forma klipslenir, rengi `src/lib/color.js`'teki `shadeColor`/`getLuminance` ile seçilen renkten otomatik hesaplanır. "Sepete Ekle"de sentetik bir ürün nesnesi (`id`, `name: "Özel Tasarım — …"`, sabit `price`, `custom` açıklayıcısı) `addItem`'a geçirilir; `CartPage` bu satırlarda küçük bir `CeramicPreview` gösterir.

**Atölyeler akışı**: `src/data/workshops.js`, haftalık gün eşleşmesi kurallarından (Salı=Büyükler, Perşembe=Baba-Çocuk, Cumartesi=Anne-Çocuk) `new Date()`'e göre bugünden ~90 gün ileriye kadar somut tarihler üretir (literal tarih hardcode edilmez, zamanla bayatlamaz). `WorkshopCalendar.js` ay ızgarasını render eder (geçmiş günler tıklanamaz, mobilde tek sütun listeye döner); bir güne tıklanınca `WorkshopDetail.js` açılır, "Katıl" ile `RegistrationForm.js` gösterilir. `RegistrationForm.js`, katılımcı sayısını `workshop.capacity`'ye karşı doğrular (input'ta `max` + submit'te client-side hata mesajı); `api/validatePayload.js` aynı limiti `api/lib/workshopCapacities.js`'teki `WORKSHOP_CAPACITIES` üzerinden sunucu tarafında da uygular. Bu dosya `src/data/workshops.js`'teki kapasitelerin manuel bir kopyasıdır (`ponytail:` yorumuyla işaretli) — atölye kapasitesi değişirse ikisi de güncellenmeli.

**Ödeme simülasyonu**: `CartPage.js`'teki "Siparişi Tamamla", `CheckoutForm.js`'i açar — giriş yapılmamışsa önce Ad/Telefon/E-posta adımı, ardından (giriş yapılmışsa doğrudan) `PaymentForm.js` (sahte kart formu + canlı kart önizlemesi + ~1.5sn sahte gecikme) gösterilir. **Kart bilgileri (numara/isim/son kullanma/CVV) hiçbir zaman webhook'a gönderilmez** — sadece `PaymentForm` içinde local state olarak tutulur; "Ödemeyi Onayla" sadece `CheckoutForm`'daki mevcut webhook mantığını tetikler.

**Webhook gönderim noktaları** (`src/lib/webhook.js`'teki `sendWebhookEvent`, bkz. `.claude/skills/atolyekart-conventions`):
- `place_order` — `CheckoutForm.js`, ödeme onaylandığı anda (`PaymentForm`'un "Ödemeyi Onayla"sı sonrası), sepetteki her satır için ayrı istek
- `request_stock_notification` — `StockNotifyForm.js`, stokta yok bildirimi formunda
- `workshop_registration` — `RegistrationForm.js`, atölye kayıt formu gönderildiğinde (tarih + atölye türü dahil)

## Ana Bileşenler

- `Navbar` (masaüstü yatay menü + mobil hamburger paneli), `Footer` — site geneli çerçeve
- `LoginForm` — giriş/kayıt formu (`AuthContext`'e, dolayısıyla Supabase Auth'a bağlı)
- `ProductCard`, `ProductImage`, `ProductList` — katalog ürün gösterimi
- `AboutSection`, `FamilySection`, `CeramicArtSection` — Biz Kimiz / Ana Sayfa anlatı bölümleri
- `CeramicPreview`, `DesignPage` — Kendin Tasarla konfigüratörü ve SVG önizleme
- `WorkshopCalendar`, `WorkshopDetail`, `RegistrationForm` — Atölyeler takvimi ve kayıt akışı
- `CheckoutForm`, `PaymentForm`, `StockNotifyForm`, `Toast`, `QrCode` — sepet/ödeme/bildirim yardımcı bileşenleri

## Bilinen Bağımlılık Zafiyetleri (kabul edilmiş risk)

`npm audit`, `react-router-dom@^6.30.4`'ün bağımlılığı `react-router` üzerinden 2 orta (moderate) seviye zafiyet raporluyor. Düzeltme v7'ye major upgrade gerektiriyor; bilinçli olarak yapılmadı (2026-08-01). Gerekçe, tekrar audit çalıştırıldığında hatırlanması için:

- **Open redirect via backslash in `<Link>`/`useNavigate`**: Sömürülmesi, kullanıcı girdisinden gelen bir `to`/navigate hedefi gerektirir. Projede tüm route hedefleri (`Navbar`, sayfa geçişleri, `Link to="/privacy-policy"` vb.) kod içinde sabit string'lerdir — kullanıcıdan alınan hiçbir değer `to`/`navigate()` argümanı olarak kullanılmaz.
- **Arbitrary Constructor Injection via `deserializeErrors()` (SSR hydration)**: Proje build aracı/SSR kullanmıyor (native ES modules, `HashRouter`, statik host) — bu zafiyet yalnızca server-side rendering hydration akışında tetiklenir, burada hiç yok.

Major upgrade ileride gündeme gelirse (örn. SSR'a geçiş veya kullanıcı girdili navigasyon eklenirse) bu gerekçe geçersiz olur, o zaman yeniden değerlendirilmeli.

## Token disiplini

- Mekanik işlerde (dosya düzenleme, tek component çevirisi, config değişikliği) subagent/Task kullanma, işi doğrudan yap.
- Tam kod tabanı taraması sadece kullanıcı açıkça istediğinde yapılsın.
- Faz/görev sonlarında sadece yapılan değişiklikleri özetle, dosyaları baştan okuma.
- Yeni bağımlılık eklemeden önce mevcut paketlerle çözülüp çözülemeyeceğini kontrol et; gerekiyorsa kullanıcıya sor.
- Uzun oturumlarda faz sonlarında `/compact` önerisini hatırlat.

### Plugin konfigürasyonu

Oturum başında iş türüne göre şu pluginler açık/kapalı olmalı:

| İş türü | Açık | Kapalı |
|---|---|---|
| Kod düzenleme / component çevirisi / config | ponytail, security-guidance | superpowers, claude-mem, ralph-loop |
| Sıfırdan mimari, brainstorming, büyük refactor | ponytail, security-guidance, superpowers | claude-mem, ralph-loop |
| Çok sayıda kısa oturumlu yeni proje | claude-mem | — |
| Web/HTML-CSS tasarım işi | frontend-design (React Native'de işe yaramaz) | — |

Not: Plugin değişikliğini Claude yapamaz — kullanıcıya `/plugin` → `Installed` → `Space` → `Esc` → `/reload-plugins` adımlarını hatırlatmalı.
