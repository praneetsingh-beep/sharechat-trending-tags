import type { RawSignal } from '../types';

/**
 * Wikipedia — most viewed pages from Indian Wikipedia (hi.wikipedia + en.wikipedia
 * Indian-tagged pages). Strong proxy for what India is curious about right now.
 */
export async function fetchWikipediaTrending(): Promise<RawSignal[]> {
  const fetchedAt = Date.now();
  const out: RawSignal[] = [];

  // Yesterday's date in YYYY/MM/DD — pageviews has a 1-day lag
  const d = new Date(Date.now() - 24 * 3600 * 1000);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');

  const projects = ['en.wikipedia', 'hi.wikipedia'];

  await Promise.all(projects.map(async (proj) => {
    try {
      const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/${proj}/all-access/${yyyy}/${mm}/${dd}`;
      const res = await fetch(url, { next: { revalidate: 0 } });
      if (!res.ok) return;
      const json = await res.json() as {
        items?: Array<{ articles: Array<{ article: string; views: number; rank: number }> }>;
      };
      const articles = json.items?.[0]?.articles ?? [];
      for (const a of articles.slice(0, 50)) {
        // skip Wikipedia administrative pages
        if (/^(Main_Page|Special:|Wikipedia:|File:|Category:|Help:|Portal:)/i.test(a.article)) continue;
        if (a.article === '-') continue;
        out.push({
          source: 'wikipedia',
          term: a.article.replace(/_/g, ' '),
          strength: a.views,
          fetchedAt,
          publishedAt: d.getTime()
        });
      }
    } catch (err) {
      console.warn('[wikipedia] failed:', proj, (err as Error).message);
    }
  }));

  return out;
}
