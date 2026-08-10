// ponytail: in-memory rate limit, tek instance'a özel — Vercel soğuk
// başlangıcında/paralel instance'larda sıfırlanır, dağıtık olarak tam
// doğru değil. Trafik artarsa Supabase tablosu veya Redis'e taşı.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const requestLog = new Map(); // ip -> timestamp[]

export function isRateLimited(key, now = Date.now()) {
  const recent = (requestLog.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    requestLog.set(key, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(key, recent);
  return false;
}

// TEŞHİS AMAÇLI GEÇİCİ: 429 sebebini görmek için, kalıcı değil — teşhis bitince kaldır.
export function debugRequestCount(key) {
  return (requestLog.get(key) || []).length;
}

export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers["x-real-ip"] || "unknown";
}
