# Supabase Auth Geçişi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `src/context/AuthContext.js`'teki sahte (şifre kontrolsüz) login sistemini gerçek Supabase Auth (e-posta + şifre) ile değiştirmek, `LoginForm.js`'e kayıt (signup) akışı eklemek, `Navbar.js`'i yeni `loading` durumuna göre güncellemek.

**Architecture:** `src/supabaseClient.js`'teki mevcut `supabase` client'ı `AuthContext.js` içinden kullanılır. `AuthContext`, Supabase session'ını `onAuthStateChange` ile dinler ve ham Supabase user objesini `{ id, email, username }` şekline adapte ederek dışarı verir — böylece `Navbar.js` ve `CheckoutForm.js`'in `user.username` kullanımı hiç değişmeden çalışmaya devam eder.

**Tech Stack:** React 18 (`React.createElement`, JSX/Babel yok), `@supabase/supabase-js` (zaten `package.json`'da), Vite (native ES modules, build aracı olarak).

## Global Constraints

- Build aracı olarak Vite kullanılıyor, native ES modules + `React.createElement` deseni korunur — JSX/Babel yok (bkz. `docs/superpowers/specs/2026-07-31-supabase-auth-design.md`).
- `user.username`'in mevcut iki tüketicisi (`Navbar.js:36`, `CheckoutForm.js:35`) davranış değiştirmeden çalışmaya devam etmeli.
- Kart bilgileri / ödeme akışına bu değişiklik dokunmuyor — kapsam dışı.
- Otomatik test framework'ü yok; her görev, `npm run dev` üzerinden manuel tarayıcı doğrulamasıyla kapanır.
- Tüm yeni kod `React.createElement` ile yazılır, mevcut dosyalardaki stil (fonksiyon bileşeni, `const { ... } = React;` destructure deseni) korunur.

---

## Dosya Yapısı

- **Modify:** `src/context/AuthContext.js` — Supabase session yönetimi, `login`/`signup`/`logout`/`loading`.
- **Modify:** `src/components/LoginForm.js` — login/kayıt mod toggle'ı, e-posta/kullanıcı adı/şifre alanları, hata gösterimi.
- **Modify:** `src/components/Navbar.js` — `loading` durumunda hesap bloğunu gizleme (flicker önleme).
- Yeni dosya yok — mevcut üç dosya, mevcut sorumluluklarını koruyarak güncelleniyor.

---

### Task 1: AuthContext.js — Supabase Auth entegrasyonu

**Files:**
- Modify: `src/context/AuthContext.js:1-26` (tüm dosya)

**Interfaces:**
- Consumes: `supabase` — `src/supabaseClient.js`'in default olmayan named export'u (`export const supabase = createClient(...)`).
- Produces: `useAuth()` → `{ user: { id, email, username } | null, login(email, password): Promise<void>, signup(email, password, username): Promise<void>, logout(): Promise<void>, loading: boolean }`. `login`/`signup` hata durumunda `throw` eder (Supabase `error` objesini fırlatır) — çağıran taraf (`LoginForm`) `try/catch` ile yakalar.

- [ ] **Step 1: `AuthContext.js`'i Supabase'e göre yeniden yaz**

`src/context/AuthContext.js` dosyasının tamamını şu içerikle değiştir:

```js
import React from "react";
import { supabase } from "../supabaseClient.js";

const { createContext, useContext, useState, useEffect, useMemo } = React;

const AuthContext = createContext(null);

function toUser(session) {
  if (!session || !session.user) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    username: session.user.user_metadata?.username ?? session.user.email,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(toUser(session));
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toUser(session));
      setLoading(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signup(email, password, username) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) throw error;
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  const value = useMemo(
    () => ({ user, login, signup, logout, loading }),
    [user, loading]
  );

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  return useContext(AuthContext);
}
```

- [ ] **Step 2: Supabase Dashboard'da e-posta doğrulamasını kapat**

Supabase projesinin Dashboard'unda **Authentication → Providers → Email** altında **"Confirm email"** seçeneğini kapat. (Bu bir dashboard ayarıdır, kod değişikliği değildir — spec'in "E-posta doğrulama: Kapalı" kararı bunu gerektiriyor. Kapatılmazsa Task 4'teki manuel kayıt testinde kullanıcı anında giriş yapamaz, "e-postanızı doğrulayın" mesajı alır.)

- [ ] **Step 3: Dev server'ı başlat ve konsol hatası olmadığını doğrula**

Çalıştır: `npm run dev`
Tarayıcıda `http://localhost:5173/` aç, DevTools konsolunu kontrol et.
Beklenen: Konsolda `AuthContext.js` veya `supabaseClient.js` importlarıyla ilgili hata yok, sayfa normal yükleniyor (henüz UI değişikliği yok, `LoginForm` hâlâ eski username/password alanlarını kullanıyor — Task 2'de güncellenecek).

- [ ] **Step 4: Commit**

```bash
git add src/context/AuthContext.js
git commit -m "AuthContext'i sahte login yerine Supabase Auth session'ına bağla"
```

---

### Task 2: LoginForm.js — login/kayıt formu ve hata gösterimi

**Files:**
- Modify: `src/components/LoginForm.js:1-38` (tüm dosya)

**Interfaces:**
- Consumes: `useAuth()` → `{ login(email, password), signup(email, password, username) }` (Task 1'de tanımlandı, ikisi de hata durumunda `throw` eder).
- Produces: `LoginForm({ onSuccess })` — davranışı değişmedi, başarılı login/signup sonrası hâlâ `onSuccess()` çağırıyor. `Navbar.js` ve varsa diğer kullanım yerleri değişiklik gerektirmiyor.

- [ ] **Step 1: `LoginForm.js`'i login/kayıt mod toggle'ıyla yeniden yaz**

`src/components/LoginForm.js` dosyasının tamamını şu içerikle değiştir:

```js
import React from "react";
import { useAuth } from "../context/AuthContext.js";

const { useState } = React;

const ERROR_MESSAGES = {
  "Invalid login credentials": "E-posta veya şifre hatalı",
  "User already registered": "Bu e-posta zaten kayıtlı",
};

export function LoginForm({ onSuccess }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else {
        await signup(email.trim(), password, username.trim());
      }
      onSuccess();
    } catch (err) {
      setError(ERROR_MESSAGES[err.message] ?? err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function toggleMode() {
    setMode((current) => (current === "login" ? "signup" : "login"));
    setError(null);
  }

  return React.createElement(
    "form",
    { className: "card-form", onSubmit: handleSubmit },
    React.createElement("input", {
      className: "card-form-input",
      type: "email",
      placeholder: "E-posta",
      value: email,
      onChange: (event) => setEmail(event.target.value),
      required: true,
    }),
    mode === "signup" &&
      React.createElement("input", {
        className: "card-form-input",
        type: "text",
        placeholder: "Kullanıcı Adı",
        value: username,
        onChange: (event) => setUsername(event.target.value),
        required: true,
      }),
    React.createElement("input", {
      className: "card-form-input",
      type: "password",
      placeholder: "Şifre",
      value: password,
      onChange: (event) => setPassword(event.target.value),
      required: true,
    }),
    error &&
      React.createElement(
        "p",
        { className: "card-form-message card-form-message--error" },
        error
      ),
    React.createElement(
      "button",
      { type: "submit", className: "card-button", disabled: submitting },
      submitting
        ? (mode === "login" ? "Giriş yapılıyor..." : "Kayıt olunuyor...")
        : (mode === "login" ? "Giriş Yap" : "Kayıt Ol")
    ),
    React.createElement(
      "button",
      { type: "button", className: "card-button card-button--secondary", onClick: toggleMode },
      mode === "login" ? "Hesabın yok mu? Kayıt Ol" : "Zaten hesabın var mı? Giriş Yap"
    )
  );
}
```

Not: `card-button`, `card-button--secondary`, `card-form-message--error` class'ları zaten `index.html`'deki `<style>` bloğunda tanımlı (`CheckoutForm.js`/`PaymentForm.js` ile paylaşılıyor) — yeni CSS eklenmiyor.

- [ ] **Step 2: Kayıt akışını tarayıcıda doğrula**

`npm run dev` çalışırken tarayıcıda Navbar'daki "Giriş Yap" butonuna tıkla:
1. "Hesabın yok mu? Kayıt Ol" linkine tıkla → E-posta, Kullanıcı Adı, Şifre alanlarının göründüğünü doğrula.
2. Gerçek bir test e-postası (ör. `test+<timestamp>@example.com`), bir kullanıcı adı ve şifre (min. 6 karakter, Supabase varsayılan kuralı) gir, "Kayıt Ol"a tıkla.
3. Beklenen: Form kapanır (dropdown/panel), Navbar'da "Merhaba, `<kullanıcı adı>`" görünür — Task 1 Step 2'de e-posta doğrulaması kapatıldıysa anında giriş olur.

- [ ] **Step 3: Yanlış şifre ve giriş akışını doğrula**

1. Navbar'da "Çıkış Yap" ile çık.
2. "Giriş Yap"a tıkla (mod zaten "login" olmalı), Step 2'de kayıt olunan e-postayla **yanlış** bir şifre gir.
3. Beklenen: Kırmızı "E-posta veya şifre hatalı" mesajı görünür, form kapanmaz.
4. Doğru şifreyle tekrar dene → giriş başarılı, Navbar "Merhaba, `<kullanıcı adı>`" gösteriyor.

- [ ] **Step 4: Commit**

```bash
git add src/components/LoginForm.js
git commit -m "LoginForm'a Supabase login/kayıt akışını ve hata gösterimini ekle"
```

---

### Task 3: Navbar.js — `loading` durumunda hesap bloğunu gizleme

**Files:**
- Modify: `src/components/Navbar.js:22-52`

**Interfaces:**
- Consumes: `useAuth()` → artık `loading` alanı da veriyor (Task 1).
- Produces: Değişmiyor — `Navbar` dışa hiçbir yeni prop/export vermiyor.

- [ ] **Step 1: `loading` durumunu `accountControl` hesaplamasına ekle**

`src/components/Navbar.js:24` satırını değiştir:

```js
  const { user, logout } = useAuth();
```

şuna:

```js
  const { user, logout, loading } = useAuth();
```

`src/components/Navbar.js:32-52` aralığındaki `accountControl` tanımını değiştir — mevcut hâli:

```js
  const accountControl = user
    ? React.createElement(
```

şuna:

```js
  const accountControl = loading
    ? null
    : user
    ? React.createElement(
```

(Ternary'nin geri kalanı — `logout` butonu ve "Giriş Yap" butonu dahil `:` sonrası kısım — aynı kalıyor, sadece başa `loading ? null :` ekleniyor.)

- [ ] **Step 2: Flicker'ın gittiğini doğrula**

1. Task 2'de kayıt olunan hesapla giriş yapılmış hâldeyken tarayıcıda sayfayı yenile (F5).
2. Beklenen: Sayfa yüklenirken kısa bir an "Giriş Yap" butonu **görünmüyor** (accountControl `null`), ardından doğrudan "Merhaba, `<kullanıcı adı>`" beliriyor — session `localStorage`'dan geri yükleniyor.
3. Network sekmesinde Supabase `/auth/v1/token?grant_type=refresh_token` (veya session) isteğinin gittiğini doğrula.

- [ ] **Step 3: Commit**

```bash
git add src/components/Navbar.js
git commit -m "Navbar'da session yüklenirken hesap bloğunu gizleyerek flicker'ı önle"
```

---

### Task 4: Uçtan uca manuel doğrulama

**Files:**
- Değişiklik yok — bu görev, önceki üç görevin birlikte doğru çalıştığını sepet/ödeme/webhook akışı üzerinden doğrular.

**Interfaces:**
- Consumes: Task 1-3'te tamamlanan `AuthContext`/`LoginForm`/`Navbar`.
- Produces: Yok (doğrulama görevi).

- [ ] **Step 1: Sepet + webhook akışını giriş yapılmışken doğrula**

1. Giriş yapılmış hâldeyken (`Merhaba, <kullanıcı adı>` görünüyor) `/#/urunler`'e git, bir ürünü sepete ekle.
2. `/#/sepet`'e git, "Siparişi Tamamla"ya tıkla.
3. Beklenen: İletişim adımı (Ad/Telefon/E-posta) **atlanır**, doğrudan `PaymentForm` (sahte kart formu) açılır — `CheckoutForm.js:12`'deki `useState(user ? "payment" : "contact")` mantığı.
4. Sahte kart bilgileriyle "Ödemeyi Onayla"ya tıkla, ~1.5sn sonra başarı mesajını doğrula.
5. `webhook.site` üzerinde (`.env`'deki `WEBHOOK_URL`) gelen `place_order` isteğini kontrol et: `name` alanı kayıt sırasında girilen kullanıcı adı olmalı, `phone`/`email` alanları payload'da **hiç bulunmamalı**.

- [ ] **Step 2: Çıkış yapılmışken eski akışın bozulmadığını doğrula**

1. "Çıkış Yap" ile çık, sepete tekrar bir ürün ekle, "Siparişi Tamamla"ya tıkla.
2. Beklenen: İletişim adımı (Ad/Telefon/E-posta) bu kez **görünür** — giriş yapılmamış kullanıcı akışı değişmedi.
3. Formu doldurup tamamla, webhook payload'unda bu kez `name`/`phone`/`email` alanlarının girilen değerlerle geldiğini doğrula.

- [ ] **Step 3: Spec'teki kalan test adımlarını doğrula ve kapanışı işaretle**

`docs/superpowers/specs/2026-07-31-supabase-auth-design.md`'deki "Test" bölümündeki 5 madde (kayıt, çıkış+tekrar giriş, sayfa yenileme, yanlış şifre, webhook) Task 2/3/4'te tek tek doğrulandı — hepsinin geçtiğini teyit et. Hepsi geçtiyse bu görev tamamlanmış sayılır (ek commit gerekmiyor, kod değişikliği yok).
