import assert from "node:assert";
import { isRateLimited, getClientIp } from "./rateLimit.js";

const WINDOW_MS = 60_000;

// Aynı key'e ardışık 5 çağrı: hepsi izinli
{
  const key = "1.2.3.4";
  const now = 1000000;
  for (let i = 0; i < 5; i++) {
    assert.strictEqual(isRateLimited(key, now), false, `${i + 1}. istek izinli olmalı`);
  }
}

// 6. istek: limitli
{
  const key = "1.2.3.5";
  const now = 2000000;
  for (let i = 0; i < 5; i++) {
    isRateLimited(key, now);
  }
  assert.strictEqual(isRateLimited(key, now), true, "6. istek limitli olmalı");
}

// Farklı key'in sayacı bağımsız
{
  const keyA = "10.0.0.1";
  const keyB = "10.0.0.2";
  const now = 3000000;
  for (let i = 0; i < 5; i++) {
    isRateLimited(keyA, now);
  }
  assert.strictEqual(isRateLimited(keyA, now), true, "keyA limitli olmalı");
  assert.strictEqual(isRateLimited(keyB, now), false, "keyB etkilenmemeli");
}

// Pencere geçince sayaç sıfırlanır
{
  const key = "10.0.0.3";
  const now = 4000000;
  for (let i = 0; i < 5; i++) {
    isRateLimited(key, now);
  }
  assert.strictEqual(isRateLimited(key, now), true, "pencere içinde limitli olmalı");
  assert.strictEqual(
    isRateLimited(key, now + WINDOW_MS + 1),
    false,
    "pencere geçtikten sonra tekrar izinli olmalı"
  );
}

// getClientIp: x-forwarded-for varsa ilk değeri alır
{
  const req = { headers: { "x-forwarded-for": "203.0.113.5, 70.41.3.18" } };
  assert.strictEqual(getClientIp(req), "203.0.113.5");
}

// getClientIp: x-forwarded-for yoksa x-real-ip'e düşer
{
  const req = { headers: { "x-real-ip": "198.51.100.7" } };
  assert.strictEqual(getClientIp(req), "198.51.100.7");
}

// getClientIp: hiçbiri yoksa "unknown"
{
  const req = { headers: {} };
  assert.strictEqual(getClientIp(req), "unknown");
}

console.log("Tüm rateLimit testleri geçti ✓");
