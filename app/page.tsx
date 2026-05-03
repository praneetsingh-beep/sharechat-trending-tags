import { FeedHeader } from '@/components/FeedHeader';
import { TrendsRail } from '@/components/TrendsRail';
import { MockFeedCard } from '@/components/MockFeedCard';
import { runPipeline } from '@/lib/pipeline';
import { readCache } from '@/lib/cache';
import type { TrendsPayload } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getInitial(): Promise<TrendsPayload | null> {
  // Prefer fresh cache, build if missing/stale
  const cached = await readCache();
  if (cached && Date.now() - cached.generatedAt < 30 * 60 * 1000) return cached;
  try {
    return await runPipeline();
  } catch (err) {
    console.error('[home] initial pipeline failed:', err);
    return cached; // serve stale rather than nothing
  }
}

export default async function Home() {
  const initial = await getInitial();

  return (
    <main className="pb-20">
      <FeedHeader />
      <TrendsRail initial={initial} />
      <div className="border-t border-sc-border/60" />
      {/* fake feed underneath so the rail feels embedded in a real feed */}
      {[0, 1, 2, 3].map(i => <MockFeedCard key={i} idx={i} />)}
    </main>
  );
}
