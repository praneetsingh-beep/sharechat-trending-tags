import { fetchAllSignals } from './sources';
import { clusterSignals } from './extractor';
import { rankClusters } from './ranker';
import { enrichWithHindi } from './translator';
import { writeCache } from './cache';
import type { TrendsPayload } from './types';

/** Run the full pipeline end-to-end. Returns the fresh payload and writes it to cache. */
export async function runPipeline(): Promise<TrendsPayload> {
  const t0 = Date.now();

  const signals = await fetchAllSignals();
  const clusters = clusterSignals(signals);
  const ranked = rankClusters(clusters);
  const tags = await enrichWithHindi(ranked);

  const payload: TrendsPayload = {
    generatedAt: Date.now(),
    tags: tags.slice(0, 12), // surface top 12, assignment minimum is 10
    meta: {
      sourcesUsed: [...new Set(signals.map(s => s.source))],
      rawSignalCount: signals.length,
      durationMs: Date.now() - t0
    }
  };

  await writeCache(payload);
  return payload;
}
