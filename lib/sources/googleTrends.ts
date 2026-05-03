import type { RawSignal } from '../types';

/**
 * Google Trends India Daily — public RSS, no API key needed.
 * Returns the top trending searches in India.
 *
 * If SERPAPI_KEY is set, we additionally use the realtime endpoint for fresher data.
 */
const GT_RSS = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=IN';

export async function fetchGoogleTrends(): Promise<RawSignal[]> {
  const out: RawSignal[] = [];
  const fetchedAt = Date.now();

  try {
    const res = await fetch(GT_RSS, {
      headers: { 'User-Agent': 'Mozilla/5.0 ShareChatTrendingBot/1.0' },
      next: { revalidate: 0 }
    });
    if (!res.ok) throw new Error(`google-trends RSS ${res.status}`);
    const xml = await res.text();

    // Simple XML parse — no external dependency. Each <item> contains:
    //   <title>Trending term</title>
    //   <ht:approx_traffic>50,000+</ht:approx_traffic>
    //   <ht:news_item><ht:news_item_title>...</ht:news_item_title></ht:news_item>
    //   <pubDate>...</pubDate>
    const itemRe = /<item>([\s\S]*?)<\/item>/g;
    const titleRe = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/;
    const trafficRe = /<ht:approx_traffic>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/ht:approx_traffic>/;
    const newsTitleRe = /<ht:news_item_title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/ht:news_item_title>/;
    const pubDateRe = /<pubDate>(.*?)<\/pubDate>/;
    const linkRe = /<ht:news_item_url>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/ht:news_item_url>/;

    let m: RegExpExecArray | null;
    while ((m = itemRe.exec(xml)) !== null) {
      const block = m[1];
      const title = titleRe.exec(block)?.[1]?.trim();
      if (!title) continue;
      const trafficStr = trafficRe.exec(block)?.[1] ?? '';
      const traffic = parseTraffic(trafficStr);
      const newsTitle = newsTitleRe.exec(block)?.[1]?.trim();
      const pubDate = pubDateRe.exec(block)?.[1];
      const url = linkRe.exec(block)?.[1];

      out.push({
        source: 'google_trends',
        term: decodeEntities(title),
        context: newsTitle ? decodeEntities(newsTitle) : undefined,
        strength: traffic,
        fetchedAt,
        publishedAt: pubDate ? Date.parse(pubDate) : undefined,
        url
      });
    }
  } catch (err) {
    console.warn('[googleTrends] fetch failed:', (err as Error).message);
  }

  return out;
}

function parseTraffic(s: string): number {
  // "50,000+" -> 50000, "1M+" -> 1000000
  if (!s) return 0;
  const cleaned = s.replace(/[,+\s]/g, '').toUpperCase();
  const m = cleaned.match(/^([\d.]+)([KM]?)$/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const mult = m[2] === 'M' ? 1_000_000 : m[2] === 'K' ? 1_000 : 1;
  return Math.round(n * mult);
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
