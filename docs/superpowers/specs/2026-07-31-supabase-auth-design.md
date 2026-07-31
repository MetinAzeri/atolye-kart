# Supabase Auth ile Sahte Login'in Değiştirilmesi

**Tarih:** 2026-07-31
**Durum:** Onaylandı

## Bağlam

`src/context/AuthContext.js`, şu anda tamamen sahte bir "üyelik" sistemi sağlıyor: `login(username)` şifreyi hiç kontrol etmeden `user`'ı `{ username }` olarak set ediyor, kalıcılık (localStorage) yok. `src/supabaseClient.js` zaten oluşturuldu ve `.env`'deki `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` ile Supabase client'ı initialize ediyor. Bu spec, mock login'i gerçek Supabase Auth (e-posta + şifre) ile değiştirmeyi tanımlıyor.

`user.username`'in mevcut iki tüketicisi var — bunların davranışı korunmalı:
- `src/components/Navbar.js:36` — `Merhaba, ${user.username}`
- `src/components/CheckoutForm.js:35` — webhook payload'unda `name: user.username`

## Kapsam kararları

- **Auth yöntemi:** E-posta + şifre (Supabase `signInWithPassword` / `signUp`).
- **Kayıt akışı:** Site üzerinden kayıt (signup) da var — ayrı bir form değil, `LoginForm` içinde login/kayıt arası geçiş.
- **E-posta doğrulama:** Kapalı — Supabase Dashboard'da "Confirm email" kapatılacak (bu spec'in kapsamı dışında, manuel dashboard ayarı), kayıt olan kullanıcı anında oturum açar.
- **Kullanıcı adı:** Kayıt formunda ayrı bir "Kullanıcı Adı" alanı var, `signUp` çağrısında `options.data.username` olarak Supabase `user_metadata`'sına yazılır.

## Mimari — `AuthContext.js`

- `supabaseClient.js`'teki `supabase` client'ı kullanılır.
- Mount'ta `supabase.auth.getSession()` ile mevcut session okunur; ardından `supabase.auth.onAuthStateChange((event, session) => ...)` ile login/logout/token-refresh olayları dinlenir. Supabase'in varsayılan `persistSession` (localStorage) davranışıyla birlikte, sayfa yenilendiğinde kullanıcı giriş yapılmış kalır — mock'ta olmayan, gerçek auth'un standart davranışı.
- Context `value`'su: `{ user, login, signup, logout, loading }`.
  - `user`: ham Supabase user objesi değil, `{ id, email, username }` şekline adapte edilir (`username`: `user_metadata.username`) — `Navbar.js`/`CheckoutForm.js` değişmeden çalışmaya devam eder.
  - `loading`: ilk `getSession()` sonucu gelene kadar `true`. Navbar'ın "Merhaba, X" / "Giriş Yap" durumları arasında yanlış an için yanıp sönmesini engeller.
  - `login(email, password)` → `supabase.auth.signInWithPassword`.
  - `signup(email, password, username)` → `supabase.auth.signUp({ email, password, options: { data: { username } } })`.
  - `logout()` → `supabase.auth.signOut()`.

## Bileşenler — `LoginForm.js`

- Login/Kayıt arası basit mod toggle'ı (`mode` state'i: `"login"` | `"signup"`), üstte geçiş linki.
- Login modu: E-posta + Şifre.
- Kayıt modu: E-posta + Kullanıcı Adı + Şifre.
- Mevcut "Kullanıcı Adı" input'u login modunda "E-posta" (`type="email"`) input'una dönüşür.
- `handleSubmit`, mod'a göre `login` veya `signup` çağırır (async).
- Hata state'i (`error`) eklenir, form altında gösterilir. Bilinen Supabase hata mesajları Türkçe'ye çevrilir:
  - `Invalid login credentials` → "E-posta veya şifre hatalı"
  - `User already registered` → "Bu e-posta zaten kayıtlı"
  - Tanınmayan hatalar olduğu gibi gösterilir.
- Submit sırasında buton `disabled` + "Giriş yapılıyor..." / "Kayıt olunuyor..." metni (auth çağrısı network isteği, mock'taki gibi anlık değil).
- Başarılı istekten sonra hâlâ `onSuccess()` çağrılır (davranış aynı).

## Veri akışı

1. Uygulama açılır → `AuthProvider` mount → `loading: true` ile `getSession()` çağrılır → session varsa `user` dolu, yoksa `null`, `loading: false`.
2. Kullanıcı `LoginForm`'da giriş/kayıt yapar → Supabase çağrısı döner → `onAuthStateChange` tetiklenir → `user` güncellenir → `LoginForm` `onSuccess()` çağırır.
3. Navbar `user.username` ile "Merhaba, X" gösterir (JSX değişmiyor, veri kaynağı değişiyor).
4. `CheckoutForm`, giriş yapılmışsa iletişim adımını atlayıp `user.username`'i webhook `name` alanına koyar (davranış korunuyor).
5. `logout()` → `supabase.auth.signOut()` → `onAuthStateChange` `user`'ı `null` yapar.

## Hata yönetimi

- `LoginForm` hata mesajları yukarıdaki gibi çevrilir/gösterilir.
- `.env`'de env variable'lar eksikse `supabaseClient.js`'teki `createClient` zaten hata fırlatır — ekstra kontrol eklenmiyor (YAGNI).
- `getSession()`/`onAuthStateChange` ağ hatası verirse sessizce `loading: false` + `user: null`'a düşülür, Navbar zaten "Giriş Yap" gösterir — ekstra hata UI'ı eklenmiyor.

## Test

- Otomatik test altyapısı yok (native ES modules projede test framework yok), bu değişiklik için de eklenmiyor.
- Manuel test planı (`npm run dev` ile):
  1. Yeni e-posta + şifre + kullanıcı adıyla kayıt ol → anında giriş olduğunu doğrula.
  2. Çıkış yap → aynı bilgilerle tekrar giriş yap.
  3. Sayfayı yenile → giriş durumunun korunduğunu doğrula (persistSession).
  4. Yanlış şifreyle giriş dene → Türkçe hata mesajını doğrula.
  5. Giriş yapılmışken sepete ürün ekleyip "Siparişi Tamamla" ile webhook payload'unda `name` alanının doğru geldiğini doğrula (webhook.site).

## Kapsam dışı

- Şifre sıfırlama (forgot password) akışı.
- Google OAuth veya diğer provider'lar.
- E-posta doğrulama zorunluluğu.
- Kullanıcı profili düzenleme (e-posta/şifre değiştirme).
