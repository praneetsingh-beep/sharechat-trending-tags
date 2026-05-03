import { NextRequest, NextResponse } from 'next/server';
import { runPipeline } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel hobby plan limit

/**
 * Cron-triggered refresh. Vercel cron headers come with `x-vercel-cron`.
 * For manual refresh from the UI we accept a CRON_SECRET via query.
 */
export async function GET(req: NextRequest) {
  const isCron = !!req.headers.get('x-vercel-cron');
  const provided = req.nextUrl.searchParams.get('secret');
  const expected = process.env.CRON_SECRET;
  const isAuthorised = isCron || (expected && provided === expected) || !expected; // allow unauthed if secret unset (dev)

  if (!isAuthorised) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  }

  try {
    const payload = await runPipeline();
    return NextResponse.json({
      ok: true,
      tagCount: payload.tags.length,
      sources: payload.meta.sourcesUsed,
      durationMs: payload.meta.durationMs
    });
  } catch (err) {
    console.error('[/api/refresh] pipeline failed:', err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
