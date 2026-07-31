import assert from "node:assert";
import { validatePayload } from "./validatePayload.js";

// place_order: geçerli, source spoof edilmeye çalışılıyor
{
  const result = validatePayload({
    event: "place_order",
    name: "Ayşe Yılmaz",
    productId: "nar-cicegi-kase",
    productName: "Nar Çiçeği Kase",
    quantity: 2,
    source: "spoofed",
  });
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.payload.source, "atolyekart");
  assert.strictEqual(result.payload.name, "Ayşe Yılmaz");
  assert.strictEqual(result.payload.quantity, 2);
}

// place_order: giriş yapmış kullanıcı senaryosu — phone/email hiç yok
{
  const result = validatePayload({
    event: "place_order",
    name: "kullanici_adi",
    productId: "nar-cicegi-kase",
    productName: "Nar Çiçeği Kase",
    quantity: 1,
  });
  assert.strictEqual(result.valid, true);
  assert.strictEqual("phone" in result.payload, false);
  assert.strictEqual("email" in result.payload, false);
}

// place_order: eksik zorunlu alan (quantity yok)
{
  const result = validatePayload({
    event: "place_order",
    name: "Ayşe Yılmaz",
    productId: "nar-cicegi-kase",
    productName: "Nar Çiçeği Kase",
  });
  assert.strictEqual(result.valid, false);
}

// place_order: whitelist dışı alan
{
  const result = validatePayload({
    event: "place_order",
    name: "Ayşe Yılmaz",
    productId: "nar-cicegi-kase",
    productName: "Nar Çiçeği Kase",
    quantity: 2,
    extraField: "hack",
  });
  assert.strictEqual(result.valid, false);
}

// place_order: geçersiz e-posta formatı
{
  const result = validatePayload({
    event: "place_order",
    name: "Ayşe Yılmaz",
    productId: "nar-cicegi-kase",
    productName: "Nar Çiçeği Kase",
    quantity: 2,
    email: "not-an-email",
  });
  assert.strictEqual(result.valid, false);
}

// place_order: quantity aralık dışı
{
  const result = validatePayload({
    event: "place_order",
    name: "Ayşe Yılmaz",
    productId: "nar-cicegi-kase",
    productName: "Nar Çiçeği Kase",
    quantity: 50,
  });
  assert.strictEqual(result.valid, false);
}

// request_stock_notification: geçerli
{
  const result = validatePayload({
    event: "request_stock_notification",
    name: "Ayşe Yılmaz",
    productId: "silindir-vazo",
    productName: "Silindir Vazo",
    email: "ayse@example.com",
  });
  assert.strictEqual(result.valid, true);
}

// request_stock_notification: email eksik (bu event'te zorunlu)
{
  const result = validatePayload({
    event: "request_stock_notification",
    name: "Ayşe Yılmaz",
    productId: "silindir-vazo",
    productName: "Silindir Vazo",
  });
  assert.strictEqual(result.valid, false);
}

// workshop_registration: geçerli
{
  const result = validatePayload({
    event: "workshop_registration",
    name: "Ayşe Yılmaz",
    phone: "5321234567",
    email: "ayse@example.com",
    participantCount: 2,
    workshopDate: "2026-08-04",
    workshopType: "Baba-Çocuk",
  });
  assert.strictEqual(result.valid, true);
}

// workshop_registration: geçersiz telefon formatı (+90 önekli)
{
  const result = validatePayload({
    event: "workshop_registration",
    name: "Ayşe Yılmaz",
    phone: "+905321234567",
    email: "ayse@example.com",
    participantCount: 2,
    workshopDate: "2026-08-04",
    workshopType: "Baba-Çocuk",
  });
  assert.strictEqual(result.valid, false);
}

// workshop_registration: geçersiz tarih formatı
{
  const result = validatePayload({
    event: "workshop_registration",
    name: "Ayşe Yılmaz",
    phone: "5321234567",
    email: "ayse@example.com",
    participantCount: 2,
    workshopDate: "04-08-2026",
    workshopType: "Baba-Çocuk",
  });
  assert.strictEqual(result.valid, false);
}

// workshop_registration: participantCount aralık dışı
{
  const result = validatePayload({
    event: "workshop_registration",
    name: "Ayşe Yılmaz",
    phone: "5321234567",
    email: "ayse@example.com",
    participantCount: 50,
    workshopDate: "2026-08-04",
    workshopType: "Baba-Çocuk",
  });
  assert.strictEqual(result.valid, false);
}

// bilinmeyen event tipi
{
  const result = validatePayload({ event: "delete_everything", name: "x" });
  assert.strictEqual(result.valid, false);
}

// prototype-pollution: Object.prototype'dan miras alınan event adı çökmemeli
{
  const result = validatePayload({ event: "constructor" });
  assert.strictEqual(result.valid, false);
}

// email: 254 karakteri aşan e-posta reddedilmeli
{
  const result = validatePayload({
    event: "request_stock_notification",
    name: "Ayşe Yılmaz",
    productId: "silindir-vazo",
    productName: "Silindir Vazo",
    email: "a".repeat(250) + "@x.co",
  });
  assert.strictEqual(result.valid, false);
}

// body obje değil
{
  const result = validatePayload(null);
  assert.strictEqual(result.valid, false);
}

console.log("Tüm validatePayload testleri geçti ✓");
