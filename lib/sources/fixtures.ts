import type { RawSignal } from '../types';

/**
 * Fallback fixtures used only when ALL live sources fail (e.g., dev sandbox
 * with no internet, or every external API rate-limited at once).
 *
 * In production on Vercel this is rarely hit because we have 4 independent
 * sources and Promise.allSettled tolerates partial failures.
 *
 * Curated to feel realistic for May 2026 India: a mix of cricket, weather,
 * politics, entertainment, festival/devotional, finance, tech.
 */
export function fixtureSignals(): RawSignal[] {
  const now = Date.now();
  const hr = (h: number) => now - h * 3600 * 1000;
  return [
    // Google Trends India
    { source: 'google_trends', term: 'India vs Australia', strength: 200000, fetchedAt: now, publishedAt: hr(2), context: 'Live cricket: IND vs AUS T20I' },
    { source: 'google_trends', term: 'Mumbai Rains', strength: 100000, fetchedAt: now, publishedAt: hr(4), context: 'Heavy rainfall floods Mumbai roads' },
    { source: 'google_trends', term: 'IPL Auction 2026', strength: 500000, fetchedAt: now, publishedAt: hr(6) },
    { source: 'google_trends', term: 'Akshaya Tritiya 2026', strength: 200000, fetchedAt: now, publishedAt: hr(8) },
    { source: 'google_trends', term: 'RBI Repo Rate', strength: 50000, fetchedAt: now, publishedAt: hr(3), context: 'RBI cuts repo rate by 25 bps' },
    { source: 'google_trends', term: 'Stranger Things 5', strength: 100000, fetchedAt: now, publishedAt: hr(12) },
    { source: 'google_trends', term: 'Heeramandi 2', strength: 50000, fetchedAt: now, publishedAt: hr(10) },
    { source: 'google_trends', term: 'Lok Sabha Session', strength: 20000, fetchedAt: now, publishedAt: hr(5) },
    { source: 'google_trends', term: 'WhatsApp Down', strength: 200000, fetchedAt: now, publishedAt: hr(1) },
    { source: 'google_trends', term: 'Char Dham Yatra', strength: 100000, fetchedAt: now, publishedAt: hr(15) },

    // News API India
    { source: 'newsapi', term: 'India beats Australia by 6 wickets in T20I thriller', context: 'Rohit Sharma stars with 87 off 52', fetchedAt: now, publishedAt: hr(2), strength: 1, url: 'https://example.com/1' },
    { source: 'newsapi', term: 'Mumbai grinds to halt as monsoon arrives early', context: 'Local trains delayed, BMC issues red alert', fetchedAt: now, publishedAt: hr(4), strength: 1 },
    { source: 'newsapi', term: 'RBI cuts repo rate to 5.75%, EMIs set to drop', context: 'First cut since 2024, MPC unanimous', fetchedAt: now, publishedAt: hr(3), strength: 1 },
    { source: 'newsapi', term: 'IPL 2026 mega auction concludes — Pant most expensive', fetchedAt: now, publishedAt: hr(20), strength: 1 },
    { source: 'newsapi', term: 'Stranger Things final season drops on Netflix today', fetchedAt: now, publishedAt: hr(12), strength: 1 },
    { source: 'newsapi', term: 'Akshaya Tritiya: Gold prices touch record high', fetchedAt: now, publishedAt: hr(8), strength: 1 },
    { source: 'newsapi', term: 'Heeramandi season 2 trailer crosses 50M views', fetchedAt: now, publishedAt: hr(10), strength: 1 },
    { source: 'newsapi', term: 'WhatsApp services restored after 90-min outage', fetchedAt: now, publishedAt: hr(1), strength: 1 },
    { source: 'newsapi', term: 'Char Dham Yatra registrations cross 10 lakh', fetchedAt: now, publishedAt: hr(15), strength: 1 },
    { source: 'newsapi', term: 'Lok Sabha passes Digital Personal Data Protection rules', fetchedAt: now, publishedAt: hr(5), strength: 1 },
    { source: 'newsapi', term: 'Indian rupee hits record low against US dollar', fetchedAt: now, publishedAt: hr(7), strength: 1 },
    { source: 'newsapi', term: 'Bengaluru tech layoffs continue at major IT firms', fetchedAt: now, publishedAt: hr(22), strength: 1 },

    // Reddit r/india
    { source: 'reddit_india', term: 'India vs Australia — Rohit on fire today', strength: 8200, fetchedAt: now, publishedAt: hr(2) },
    { source: 'reddit_india', term: 'Mumbai rains: my office basement is flooded again', strength: 4100, fetchedAt: now, publishedAt: hr(4) },
    { source: 'reddit_india', term: 'RBI repo rate cut — finally some good news for home loans', strength: 2200, fetchedAt: now, publishedAt: hr(3) },
    { source: 'reddit_india', term: 'IPL auction analysis: who got the best deal?', strength: 1900, fetchedAt: now, publishedAt: hr(20) },
    { source: 'reddit_india', term: 'Stranger Things 5 spoiler-free thread', strength: 3200, fetchedAt: now, publishedAt: hr(12) },
    { source: 'reddit_india', term: 'WhatsApp was down — did anyone else freak out?', strength: 5400, fetchedAt: now, publishedAt: hr(1) },
    { source: 'reddit_india', term: 'Heeramandi 2 — thoughts on the new cast?', strength: 1100, fetchedAt: now, publishedAt: hr(10) },
    { source: 'reddit_india', term: 'Akshaya Tritiya: should I really buy gold at these prices?', strength: 2700, fetchedAt: now, publishedAt: hr(8) },
    { source: 'reddit_india', term: 'Lok Sabha passes DPDP — implications for tech companies', strength: 1500, fetchedAt: now, publishedAt: hr(5) },

    // Wikipedia
    { source: 'wikipedia', term: 'India national cricket team', strength: 45000, fetchedAt: now, publishedAt: hr(24) },
    { source: 'wikipedia', term: 'Indian Premier League', strength: 38000, fetchedAt: now, publishedAt: hr(24) },
    { source: 'wikipedia', term: 'Stranger Things', strength: 28000, fetchedAt: now, publishedAt: hr(24) },
    { source: 'wikipedia', term: 'Akshaya Tritiya', strength: 18000, fetchedAt: now, publishedAt: hr(24) },
    { source: 'wikipedia', term: 'Reserve Bank of India', strength: 12000, fetchedAt: now, publishedAt: hr(24) },
    { source: 'wikipedia', term: 'Char Dham', strength: 9000, fetchedAt: now, publishedAt: hr(24) },
    { source: 'wikipedia', term: 'Heeramandi', strength: 14000, fetchedAt: now, publishedAt: hr(24) }
  ];
}
