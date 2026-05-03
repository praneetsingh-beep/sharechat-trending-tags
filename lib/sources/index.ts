import type { RawSignal } from '../types';
import { fetchGoogleTrends } from './googleTrends';
import { fetchNewsApiIndia } from './newsApi';
import { fetchRedditIndia } from './reddit';
import { fetchWikipediaTrending } from './wikipedia';
import { fixtureSignals } from './fixtures';

export async function fetchAllSignals(): Promise<RawSignal[]> {
  const results = await Promise.allSettled([
    fetchGoogleTrends(),
    fetchNewsApiIndia(),
    fetchRedditIndia(),
    fetchWikipediaTrending()
  ]);

  const all: RawSignal[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') all.push(...r.value);
    else console.warn('[sources] one source failed:', r.reason);
  }

  // Graceful demo-mode fallback: if every live source failed, use fixtures so
  // the prototype is never empty. In production this should almost never trigger.
  if (all.length === 0) {
    console.warn('[sources] all live sources empty — using fixture fallback');
    return fixtureSignals();
  }
  return all;
}
