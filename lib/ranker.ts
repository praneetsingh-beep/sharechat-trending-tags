import type { RawSignal, SignalSource, FusedTag, Category } from './types';
import type { EntityCluster } from './extractor';

/**
 * Heat score formula. All components 0-1, weighted, then scaled to 0-100.
 *
 *   heat = 0.35·source_count + 0.25·velocity + 0.20·news_recency
 *        + 0.15·engagement   + 0.05·india_specificity
 *
 * Why this mix:
 *   • source_count (35%) — the strongest "is this real?" signal. A tag mentioned
 *     by 4 independent sources (Google + News + Reddit + Wikipedia) is far more
 *     likely to be genuinely trending than one source spiking.
 *   • velocity (25%) — captures things that are spiking right now vs. evergreen.
 *     Approximated by news/reddit recency clustering (≥2 mentions in the last 3hr).
 *   • news_recency (20%) — freshness penalty. Yesterday's news shouldn't trend.
 *   • engagement (15%) — Reddit upvotes + Google traffic + Wikipedia views as
 *     a quality multiplier. Capped to avoid one viral post dominating.
 *   • india_specificity (5%) — small bonus for tags with explicit Indian
 *     source coverage (TOI, Reddit r/india, hi.wikipedia). Small weight because
 *     the upstream sources are already India-filtered.
 */

const SOURCE_WEIGHTS: Record<SignalSource, number> = {
  google_trends: 1.0,   // direct search intent
  newsapi: 0.8,         // mainstream coverage
  reddit_india: 0.7,    // engagement-heavy but biased
  wikipedia: 0.6,       // curiosity proxy, slow to update
  gdelt: 0.5            // global news graph, reserved for future
};

export interface RankedCluster {
  cluster: EntityCluster;
  heat: number; // 0-100
  signals: {
    sourceCount: number;
    velocity: number;
    newsRecencyHrs: number;
    engagement: number;
    indiaSpecificity: number;
  };
}

export function rankClusters(clusters: EntityCluster[], now: number = Date.now()): RankedCluster[] {
  const ranked: RankedCluster[] = [];

  for (const c of clusters) {
    if (c.signals.length === 0) continue;

    // 1. Source count — number of distinct sources, weighted
    const distinctSources = new Set(c.signals.map(s => s.source));
    const sourceWeightSum = [...distinctSources].reduce((acc, s) => acc + SOURCE_WEIGHTS[s], 0);
    const sourceCountScore = Math.min(1, sourceWeightSum / 2.5);
    // 2.5 is "all 4 sources" approx — clamp to 1

    // 2. Velocity — how recent is the chatter? mentions in last 3hr / total
    const RECENT_MS = 3 * 3600 * 1000;
    const recent = c.signals.filter(s => (s.publishedAt ?? s.fetchedAt) > now - RECENT_MS).length;
    const velocity = c.signals.length > 0 ? recent / c.signals.length : 0;

    // 3. News recency — hours since most recent news/reddit signal
    const newsLikePubs = c.signals
      .filter(s => s.source === 'newsapi' || s.source === 'reddit_india')
      .map(s => s.publishedAt ?? s.fetchedAt);
    const mostRecent = newsLikePubs.length ? Math.max(...newsLikePubs) : (now - 24 * 3600 * 1000);
    const hrsSince = Math.max(0, (now - mostRecent) / 3600 / 1000);
    const newsRecencyScore = Math.exp(-hrsSince / 12); // half-life 8.3hr

    // 4. Engagement — log-scale upvotes + traffic
    const engagementRaw = c.signals.reduce((sum, s) => sum + Math.log10((s.strength ?? 1) + 1), 0);
    const engagement = Math.min(1, engagementRaw / 20); // 20 ~ very engaged

    // 5. India specificity — bonus if any reddit_india, hi.wikipedia, or TOI signal
    const indiaSignals = c.signals.filter(s =>
      s.source === 'reddit_india' ||
      (s.source === 'wikipedia' && /(_|\s)India|Indian|Bollywood|IPL|RBI/i.test(s.term)) ||
      (s.url && /(timesofindia|ndtv|thehindu|hindustantimes|indianexpress)/i.test(s.url))
    );
    const indiaSpecificity = indiaSignals.length > 0 ? 1 : 0.3;

    const heat01 =
      0.35 * sourceCountScore +
      0.25 * velocity +
      0.20 * newsRecencyScore +
      0.15 * engagement +
      0.05 * indiaSpecificity;

    ranked.push({
      cluster: c,
      heat: Math.round(heat01 * 100),
      signals: {
        sourceCount: distinctSources.size,
        velocity,
        newsRecencyHrs: hrsSince,
        engagement,
        indiaSpecificity
      }
    });
  }

  // Filters before final sort:
  //  - require ≥2 sources OR a single very-high-engagement source (avoids one-shot noise)
  //  - drop generic stuff that always ranks (e.g. single-word common terms)
  const filtered = ranked.filter(r => {
    if (r.signals.sourceCount >= 2) return true;
    if (r.signals.engagement >= 0.5) return true;
    return false;
  });

  return filtered.sort((a, b) => b.heat - a.heat);
}

/** Convert canonical text to a #Hashtag form: "India vs Australia" → "#IndiaVsAustralia" */
export function toHashtag(canonical: string): string {
  const cleaned = canonical
    .replace(/[^A-Za-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0]?.toUpperCase() + w.slice(1))
    .join('');
  return `#${cleaned}`;
}

/** Slugify for URL paths: "India vs Australia" → "india-vs-australia" */
export function toSlug(canonical: string): string {
  return canonical
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Heuristic category fallback when no LLM is configured. */
export function heuristicCategory(canonical: string, signals: RawSignal[]): Category {
  const t = canonical.toLowerCase();
  const allText = (canonical + ' ' + signals.map(s => `${s.term} ${s.context ?? ''}`).join(' ')).toLowerCase();

  if (/\b(cricket|ipl|wicket|odi|test match|t20|fifa|football|hockey|kabaddi|olympics|auction|rohit|kohli|pant|world cup)\b/.test(allText)) return 'sports';
  if (/\b(rains?|cyclone|heatwave|monsoon|flood|earthquake|weather)\b/.test(allText)) return 'weather';
  if (/\b(rbi|repo rate|sensex|nifty|stock|rupee|gdp|gold price|inflation|emi|home loan|bank)\b/.test(allText)) return 'finance';
  if (/\b(diwali|holi|eid|christmas|akshaya tritiya|raksha bandhan|ganesh|navratri|navaratri|onam|pongal|baisakhi|dussehra|janmashtami)\b/.test(allText)) return 'festival';
  if (/\b(temple|yatra|puja|mandir|aarti|katha|bhakti|devotion|sant|swami|guru|ram|krishna|shiva|hanuman|durga|char dham|kedarnath|badrinath)\b/.test(allText)) return 'devotional';
  if (/\b(netflix|prime video|hotstar|movie|film|trailer|teaser|song|album|ott|web series|bollywood|tollywood|tamil film|stranger things|heeramandi|cast|trailer|season)\b/.test(allText)) return 'entertainment';
  if (/\b(parliament|lok sabha|rajya sabha|election|bjp|congress|aap|modi|rahul gandhi|cm |minister|chief minister|dpdp|policy)\b/.test(allText)) return 'politics';
  if (/\b(google|apple|microsoft|whatsapp|chatgpt|ai|openai|tesla|jio|adani|tata|reliance|tcs|infosys|wipro|layoff)\b/.test(allText)) return 'tech';
  if (/\b(recipe|fashion|wedding|travel|food|fitness|yoga|skincare)\b/.test(allText)) return 'lifestyle';
  return 'news';
}
