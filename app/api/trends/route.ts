import { NextResponse } from 'next/server';
import { readCache } from '@/lib/cache';
import { runPipeline } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Read endpoint. Always tries to serve fresh-enough cached data; if the cache
 * is older than the staleness threshold or missing, it triggers a synchronous
 * pipeline run so the user never sees an empty screen.
 */
const STALE_AFTER_MS = 30 * 60 * 1000; // 30 min

export async function GET() {
  const cached = await readCache();
  const now = Date.now();
  const isFresh = cached && now - cached.generatedAt < STALE_AFTER_MS;

  if (isFresh) {
    return NextResponse.json(cached, {
      headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=1800' }
    });
  }

  // No cache or stale: build now (slower path)
  try {
    const fresh = await runPipeline();
    return NextResponse.json(fresh, {
      headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=1800' }
    });
  } catch (err) {
    console.error('[/api/trends] pipeline failed:', err);
    if (cached) return NextResponse.json(cached); // serve stale rather than empty
    return NextResponse.json({ error: 'Pipeline failed', detail: (err as Error).message }, { status: 500 });
  }
}
