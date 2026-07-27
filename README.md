# Kilhane Atölye

El yapımı seramik ürünleri sergileyen, tam bir e-ticaret deneyimi sunan çok sayfalı bir site — Ana Sayfa, Ürünler, Kendin Tasarla, Atölyeler, Biz Kimiz, Sepet ve Giriş/Üyelik arasında gezinme içerir. Ürünler sepete eklenip adetleri düzenlenebilir; sepetteki siparişler "Siparişi Tamamla" adımında müşteri bilgileriyle birlikte webhook üzerinden iletilir.

**Kendin Tasarla**: kullanıcının ürün tipi (tabak/bardak/tepsi/vazo), sır rengi, desen ve isteğe bağlı bir yazı seçerek kendi özel seramik parçasını tasarlayabildiği, canlı SVG önizlemeli bir araç — tasarım tamamlanınca sabit fiyatla sepete ekleniyor.

**Atölyeler**: aylık bir takvim üzerinden Büyükler, Baba-Çocuk ve Anne-Çocuk atölyelerinin (kategoriye göre renkli işaretli) yapıldığı günleri gösterir; bir güne tıklayınca detay ve bir kayıt formu açılır, gönderim webhook üzerinden iletilir.

**Giriş/Üyelik**: Navbar'dan (mobilde hamburger menü içinden) herhangi bir kullanıcı adı/şifreyle "giriş yapılabilen" sahte bir üyelik sistemi — gerçek kimlik doğrulama yapılmaz, oturum kalıcı değildir. Giriş yapılmışsa sepette "Siparişi Tamamla"ya basınca Ad/Telefon/E-posta formu atlanır, doğrudan ödeme adımına geçilir.

**Sepet / Ödeme**: sepet tamamlandığında bir ödeme ekranı simülasyonu gösterilir (kart numarası, isim, son kullanma tarihi, CVV) — bu tamamen kozmetik bir demo akışıdır, gerçek bir ödeme sistemine bağlı değildir ve gerçek ödeme alınmaz.

🔗 Canlı site: https://metinazeri.github.io/atolye-kart/
