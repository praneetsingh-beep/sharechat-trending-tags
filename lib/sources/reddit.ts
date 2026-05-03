import type { RawSignal } from '../types';

/**
 * Reddit — r/india, r/IndiaSpeaks, r/bollywood top-of-day.
 * Public JSON endpoint, no auth needed.
 */
const SUBS = ['india', 'IndiaSpeaks', 'bollywood', 'cricket', 'IndianStreetBets'];

export async function fetchRedditIndia(): Promise<RawSignal[]> {
  const fetchedAt = Date.now();
  const out: RawSignal[] = [];

  await Promise.all(SUBS.map(async (sub) => {
    try {
      const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=25`, {
        headers: { 'User-Agent': 'ShareChatTrendingBot/1.0 (research)' },
        next: { revalidate: 0 }
      });
      if (!res.ok) return;
      const json = await res.json() as {
        data?: { children?: Array<{ data: { title: string; ups: number; permalink: string; created_utc: number; selftext?: string } }> };
      };
      for (const c of json.data?.children ?? []) {
        const d = c.data;
        if (!d?.title) continue;
        out.push({
          source: 'reddit_india',
          term: d.title,
          context: d.selftext?.slice(0, 200),
          strength: d.ups,
          fetchedAt,
          publishedAt: d.created_utc * 1000,
          url: `https://www.reddit.com${d.permalink}`
        });
      }
    } catch (err) {
      console.warn('[reddit] sub failed:', sub, (err as Error).message);
    }
  }));

  return out;
}
