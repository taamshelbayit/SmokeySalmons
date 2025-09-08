// Lightweight analytics logging. In production you can swap this
// with a provider (GA, Segment, etc.). For now, we log server-side
// via Next.js API and console.

export type AnalyticsEvent =
  | { name: 'add_to_cart'; item: { key: string; name: string; flavor?: string; qty: number; price: number } }
  | { name: 'order_placed'; order: { id: string; code: string; total: number; items: number } };

// Client-side helper: fire-and-forget POST to /api/analytics
export async function track(event: AnalyticsEvent) {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true,
    });
  } catch (e) {
    // ignore
  }
}

// Server-side helper: structured console logging
export function logServerEvent(event: AnalyticsEvent) {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ type: 'analytics', ts: new Date().toISOString(), ...event }));
}
