import assert from "node:assert";
import { validatePayload } from "./validatePayload.js";

const SAMPLE_ORDER_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

// place_order: geçerli, source spoof edilmeye çalışılıyor
{
  const result = validatePayload({
    event: "place_order",
    orderId: SAMPLE_ORDER_ID,
    name: "Ayşe Yılmaz",
    productId: "nar-cicegi-kase",
    productName: "Nar Çiçeği Kase",
    quantity: 2,
    source: "spoofed",
  });
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.payload.source, "atolyekart");
  assert.strictEqual(result.payload.orderId, SAMPLE_ORDER_ID);
  assert.strictEqual(result.payload.name, "Ayşe Yılmaz");
  assert.strictEqual(result.payload.quantity, 2);
}

// place_order: giriş yapmış kullanıcı senaryosu — phone/email hiç yok
{
  const result = validatePayload({
    event: "place_order",
    orderId: SAMPLE_ORDER_ID,
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
    orderId: SAMPLE_ORDER_ID,
    name: "Ayşe Yılmaz",
    productId: "nar-cicegi-kase",
    productName: "Nar Çiçeği Kase",
  });
  assert.strictEqual(result.valid, false);
}

// place_order: orderId eksik (zorunlu alan)
{
  const result = validatePayload({
    event: "place_order",
    name: "Ayşe Yılmaz",
    productId: "nar-cicegi-kase",
    productName: "Nar Çiçeği Kase",
    quantity: 2,
  });
  assert.strictEqual(result.valid, false);
}

// place_order: orderId UUID formatında değil
{
  const result = validatePayload({
    event: "place_order",
    orderId: "not-a-uuid",
    name: "Ayşe Yılmaz",
    productId: "nar-cicegi-kase",
    productName: "Nar Çiçeği Kase",
    quantity: 2,
  });
  assert.strictEqual(result.valid, false);
}

// place_order: whitelist dışı alan
{
  const result = validatePayload({
    event: "place_order",
    orderId: SAMPLE_ORDER_ID,
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
    orderId: SAMPLE_ORDER_ID,
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
    orderId: SAMPLE_ORDER_ID,
    name: "Ayşe Yılmaz",
    productId: "nar-cicegi-kase",
    productName: "Nar Çiçeği Kase",
    quantity: 50,
  });
  assert.strictEqual(result.valid, false);
}

// place_order: katalogda olmayan productId reddedilmeli
{
  const result = validatePayload({
    event: "place_order",
    orderId: SAMPLE_ORDER_ID,
    name: "Ayşe Yılmaz",
    productId: "olmayan-urun-id",
    productName: "Uydurma Ürün",
    quantity: 1,
  });
  assert.strictEqual(result.valid, false);
}

// place_order: Kendin Tasarla custom-<timestamp> id'si kabul edilmeli
{
  const result = validatePayload({
    event: "place_order",
    orderId: SAMPLE_ORDER_ID,
    name: "Ayşe Yılmaz",
    productId: "custom-1735689600000",
    productName: "Özel Tasarım — Tabak",
    quantity: 1,
  });
  assert.strictEqual(result.valid, true);
}

// place_order: custom- ön ekli ama sayısal olmayan id reddedilmeli
{
  const result = validatePayload({
    event: "place_order",
    orderId: SAMPLE_ORDER_ID,
    name: "Ayşe Yılmaz",
    productId: "custom-abc",
    productName: "Özel Tasarım — Tabak",
    quantity: 1,
  });
  assert.strictEqual(result.valid, false);
}

// request_stock_notification: katalogda olmayan productId reddedilmeli
{
  const result = validatePayload({
    event: "request_stock_notification",
    name: "Ayşe Yılmaz",
    productId: "olmayan-urun-id",
    productName: "Uydurma Ürün",
    email: "ayse@example.com",
  });
  assert.strictEqual(result.valid, false);
}

// request_stock_notification: custom- id'si burada geçerli sayılmamalı (bu event katalog ürünlerine özel)
{
  const result = validatePayload({
    event: "request_stock_notification",
    name: "Ayşe Yılmaz",
    productId: "custom-1735689600000",
    productName: "Özel Tasarım — Tabak",
    email: "ayse@example.com",
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
    participants: [
      { name: "Ali Yılmaz", age: 8 },
      { name: "Ayşe Yılmaz", age: 35 },
    ],
    workshopDate: "2026-08-04",
    workshopType: "Baba-Çocuk",
  });
  assert.strictEqual(result.valid, true);
  assert.deepStrictEqual(result.payload.participants, [
    { name: "Ali Yılmaz", age: 8 },
    { name: "Ayşe Yılmaz", age: 35 },
  ]);
}

// workshop_registration: participants'taki isim trim'lenmeli
{
  const result = validatePayload({
    event: "workshop_registration",
    name: "Ayşe Yılmaz",
    phone: "5321234567",
    email: "ayse@example.com",
    participantCount: 1,
    participants: [{ name: "  Ali Yılmaz  ", age: 8 }],
    workshopDate: "2026-08-04",
    workshopType: "Baba-Çocuk",
  });
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.payload.participants[0].name, "Ali Yılmaz");
}

// workshop_registration: geçersiz telefon formatı (+90 önekli)
{
  const result = validatePayload({
    event: "workshop_registration",
    name: "Ayşe Yılmaz",
    phone: "+905321234567",
    email: "ayse@example.com",
    participantCount: 2,
    participants: [
      { name: "Ali Yılmaz", age: 8 },
      { name: "Ayşe Yılmaz", age: 35 },
    ],
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
    participants: [
      { name: "Ali Yılmaz", age: 8 },
      { name: "Ayşe Yılmaz", age: 35 },
    ],
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
    participants: Array.from({ length: 50 }, () => ({ name: "Katılımcı", age: 20 })),
    workshopDate: "2026-08-04",
    workshopType: "Baba-Çocuk",
  });
  assert.strictEqual(result.valid, false);
}

// workshop_registration: participantCount atölye kapasitesini aşıyor (Baba-Çocuk: 6)
{
  const result = validatePayload({
    event: "workshop_registration",
    name: "Ayşe Yılmaz",
    phone: "5321234567",
    email: "ayse@example.com",
    participantCount: 7,
    participants: Array.from({ length: 7 }, () => ({ name: "Katılımcı", age: 20 })),
    workshopDate: "2026-08-04",
    workshopType: "Baba-Çocuk",
  });
  assert.strictEqual(result.valid, false);
}

// workshop_registration: participantCount tam kapasitede geçerli olmalı
{
  const result = validatePayload({
    event: "workshop_registration",
    name: "Ayşe Yılmaz",
    phone: "5321234567",
    email: "ayse@example.com",
    participantCount: 6,
    participants: Array.from({ length: 6 }, () => ({ name: "Katılımcı", age: 20 })),
    workshopDate: "2026-08-04",
    workshopType: "Baba-Çocuk",
  });
  assert.strictEqual(result.valid, true);
}

// workshop_registration: bilinmeyen atölye türü reddedilmeli
{
  const result = validatePayload({
    event: "workshop_registration",
    name: "Ayşe Yılmaz",
    phone: "5321234567",
    email: "ayse@example.com",
    participantCount: 2,
    participants: [
      { name: "Ali Yılmaz", age: 8 },
      { name: "Ayşe Yılmaz", age: 35 },
    ],
    workshopDate: "2026-08-04",
    workshopType: "Uydurma Tür",
  });
  assert.strictEqual(result.valid, false);
}

// workshop_registration: participants eksik (zorunlu alan)
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
  assert.strictEqual(result.valid, false);
}

// workshop_registration: participants.length participantCount ile eşleşmiyor
{
  const result = validatePayload({
    event: "workshop_registration",
    name: "Ayşe Yılmaz",
    phone: "5321234567",
    email: "ayse@example.com",
    participantCount: 2,
    participants: [{ name: "Ali Yılmaz", age: 8 }],
    workshopDate: "2026-08-04",
    workshopType: "Baba-Çocuk",
  });
  assert.strictEqual(result.valid, false);
}

// workshop_registration: katılımcı ismi boş
{
  const result = validatePayload({
    event: "workshop_registration",
    name: "Ayşe Yılmaz",
    phone: "5321234567",
    email: "ayse@example.com",
    participantCount: 1,
    participants: [{ name: "  ", age: 8 }],
    workshopDate: "2026-08-04",
    workshopType: "Baba-Çocuk",
  });
  assert.strictEqual(result.valid, false);
}

// workshop_registration: katılımcı yaşı aralık dışı (0)
{
  const result = validatePayload({
    event: "workshop_registration",
    name: "Ayşe Yılmaz",
    phone: "5321234567",
    email: "ayse@example.com",
    participantCount: 1,
    participants: [{ name: "Ali Yılmaz", age: 0 }],
    workshopDate: "2026-08-04",
    workshopType: "Baba-Çocuk",
  });
  assert.strictEqual(result.valid, false);
}

// workshop_registration: katılımcı yaşı aralık dışı (100)
{
  const result = validatePayload({
    event: "workshop_registration",
    name: "Ayşe Yılmaz",
    phone: "5321234567",
    email: "ayse@example.com",
    participantCount: 1,
    participants: [{ name: "Ali Yılmaz", age: 100 }],
    workshopDate: "2026-08-04",
    workshopType: "Baba-Çocuk",
  });
  assert.strictEqual(result.valid, false);
}

// workshop_registration: katılımcı yaşı tam sayı değil
{
  const result = validatePayload({
    event: "workshop_registration",
    name: "Ayşe Yılmaz",
    phone: "5321234567",
    email: "ayse@example.com",
    participantCount: 1,
    participants: [{ name: "Ali Yılmaz", age: "otuz" }],
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
