const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export async function sendWebhookEvent(payload: Record<string, unknown>) {
  const url = `${API_BASE_URL}/api/atolye-kayit`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (networkError) {
    console.error('[webhook] network error', url, networkError);
    throw new Error('Bağlantı hatası: sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    console.error('[webhook] request failed', { url, status: response.status, body });
    if (response.status === 429) {
      throw new Error(body.error || 'Çok fazla istek gönderildi, lütfen biraz sonra tekrar deneyin.');
    }
    throw new Error(body.error || `İstek başarısız oldu (HTTP ${response.status})`);
  }
}
