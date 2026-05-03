import type { RawSignal } from '../types';

/**
 * NewsAPI.org — top headlines for India.
 * Free tier 100 req/day. Falls back gracefully if no key.
 */
export async function fetchNewsApiIndia(): Promise<RawSignal[]> {
  const key = process.env.NEWSAPI_KEY;
  const fetchedAt = Date.now();

  if (!key) {
    // Fallback: Times of India RSS (free, no key)
    return fetchToiRss();
  }

  try {
    const url = `https://newsapi.org/v2/top-headlines?country=in&pageSize=40&apiKey=${key}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`newsapi ${res.status}`);
    const json = await res.json() as {
      articles?: Array<{ title: string; description?: string; url: string; publishedAt: string; source: { name: string } }>;
    };

    return (json.articles ?? []).map(a => ({
      source: 'newsapi' as const,
      term: a.title,
      context: a.description,
      strength: 1,
      fetchedAt,
      publishedAt: Date.parse(a.publishedAt),
      url: a.url
    }));
  } catch (err) {
    console.warn('[newsApi] failed, falling back to TOI RSS:', (err as Error).message);
    return fetchToiRss();
  }
}

async function fetchToiRss(): Promise<RawSignal[]> {
  const fetchedAt = Date.now();
  const out: RawSignal[] = [];
  // Multiple TOI RSS feeds for breadth
  const feeds = [
    'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
    'https://timesofindia.indiatimes.com/rssfeeds/4719148.cms', // India
    'https://timesofindia.indiatimes.com/rssfeeds/4719161.cms', // Sports
    'https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms' // Entertainment
  ];

  await Promise.all(feeds.map(async (feedUrl) => {
    try {
      const res = await fetch(feedUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 ShareChatTrendingBot/1.0' },
        next: { revalidate: 0 }
      });
      if (!res.ok) return;
      const xml = await res.text();
      const itemRe = /<item>([\s\S]*?)<\/item>/g;
      const titleRe = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/;
      const descRe = /<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/;
      const linkRe = /<link>(.*?)<\/link>/;
      const pubRe = /<pubDate>(.*?)<\/pubDate>/;
      let m: RegExpExecArray | null;
      while ((m = itemRe.exec(xml)) !== null) {
        const block = m[1];
        const title = titleRe.exec(block)?.[1]?.trim();
        if (!title) continue;
        out.push({
          source: 'newsapi',
          term: title,
          context: descRe.exec(block)?.[1]?.trim(),
          strength: 1,
          fetchedAt,
          publishedAt: pubRe.exec(block)?.[1] ? Date.parse(pubRe.exec(block)![1]) : undefined,
          url: linkRe.exec(block)?.[1]?.trim()
        });
      }
    } catch (err) {
      console.warn('[toiRss] feed failed:', feedUrl, (err as Error).message);
    }
  }));

  return out;
}
