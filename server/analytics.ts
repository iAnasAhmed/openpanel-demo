// Reads the demo store's numbers from the self-hosted OpenPanel export API.
// The read key stays on the server; the browser only gets counts and a short event feed.
type Env = { apiUrl: string; projectId: string; clientId: string; clientSecret: string };

export const FUNNEL = ['screen_view', 'product_view', 'add_to_cart', 'begin_checkout', 'purchase'] as const;

type ExportEvent = { name: string; createdAt: string; properties?: Record<string, unknown>; path?: string };

async function query(env: Env, params: Record<string, string>) {
  const url = new URL('/export/events', env.apiUrl);
  url.search = new URLSearchParams({ projectId: env.projectId, ...params }).toString();
  const res = await fetch(url, {
    headers: { 'openpanel-client-id': env.clientId, 'openpanel-client-secret': env.clientSecret },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`OpenPanel ${res.status}`);
  return res.json() as Promise<{ meta: { totalCount: number }; data: ExportEvent[] }>;
}

export async function getAnalytics(env: Env) {
  const start = new Date(Date.now() - 24 * 3600_000).toISOString();
  const [counts, recent] = await Promise.all([
    Promise.all(FUNNEL.map(event => query(env, { event, start, limit: '1' }).then(r => r.meta.totalCount))),
    query(env, { start, limit: '12', includes: 'properties' }),
  ]);
  return {
    funnel: FUNNEL.map((event, i) => ({ event, count: counts[i] })),
    recent: recent.data.map(e => ({
      name: e.name,
      at: e.createdAt,
      detail: e.properties?.product ? String(e.properties.product) : e.properties?.total != null ? `$${e.properties.total} total` : (e.path ?? ""),
    })),
  };
}
