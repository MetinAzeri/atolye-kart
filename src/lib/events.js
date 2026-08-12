import { getVisitorId } from "./visitorId.js";

export function trackEvent(eventType, productId = null) {
  fetch("/api/track-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      visitorId: getVisitorId(),
      eventType,
      productId,
      page: window.location.hash.replace("#", "") || "/",
    }),
  }).catch(() => {}); // ponytail: analytics best-effort, sessizce yut — kullanıcı akışını asla bloklamaz
}
