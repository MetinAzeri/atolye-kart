import { createClient } from "@supabase/supabase-js";
import { VALID_PRODUCT_IDS } from "./lib/validProductIds.js";

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CUSTOM_PRODUCT_ID_PATTERN = /^custom-\d+$/;
const PRODUCT_REQUIRED = new Set(["urun_goruntulendi", "sepete_eklendi"]);
const EVENT_TYPES = new Set(["urun_goruntulendi", "sepete_eklendi", "checkout_basladi", "siparis_tamamlandi"]);

function isKnownProductId(productId) {
  return VALID_PRODUCT_IDS.has(productId) || CUSTOM_PRODUCT_ID_PATTERN.test(productId);
}

// ponytail: rate limit yok — atolye-kayit.js'teki form limiti (5/dk) burada
// çok sık ateşlenen view/add-to-cart event'lerini anında tıkar. Spam/abuse
// riski gözlenirse visitor_id başına ayrı bir limit eklenmeli.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { visitorId, eventType, productId, page } = req.body || {};

  if (typeof visitorId !== "string" || !UUID_PATTERN.test(visitorId)) {
    return res.status(400).json({ error: "Geçersiz visitorId" });
  }
  if (!EVENT_TYPES.has(eventType)) {
    return res.status(400).json({ error: "Bilinmeyen event tipi" });
  }
  if (PRODUCT_REQUIRED.has(eventType) && !isKnownProductId(productId)) {
    return res.status(400).json({ error: "Geçersiz productId" });
  }
  if (!PRODUCT_REQUIRED.has(eventType) && productId != null) {
    return res.status(400).json({ error: "Bu event productId taşımamalı" });
  }

  const { error } = await supabase.from("events").insert({
    session_id: visitorId,
    event_type: eventType,
    product_id: PRODUCT_REQUIRED.has(eventType) ? productId : null,
    page: typeof page === "string" ? page.slice(0, 200) : null,
  });

  if (error) return res.status(502).json({ error: "Insert failed" });
  res.status(204).end();
}
