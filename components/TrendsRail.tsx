'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { FusedTag, TrendsPayload } from '@/lib/types';
import { StoryCard } from './StoryCard';
import { relativeTimeHindi } from '@/lib/ui';

export function TrendsRail({ initial }: { initial: TrendsPayload | null }) {
  const [data, setData] = useState<TrendsPayload | null>(initial);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/trends', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as TrendsPayload;
      setData(json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // If we never got initial data (SSR failed), fetch on mount
  useEffect(() => {
    if (!data) refresh();
  }, [data, refresh]);

  if (!data) {
    return (
      <div className="px-4 pb-4">
        <RailSkeleton />
      </div>
    );
  }

  const tags = data.tags;

  return (
    <section className="pb-4">
      {/* header strip */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-baseline gap-2">
          <h2 className="font-hindi text-lg font-bold text-sc-text">अभी ट्रेंडिंग</h2>
          <span className="text-[11px] text-sc-mute">भारत में</span>
        </div>
        <button
          onClick={refresh}
          aria-label="Refresh"
          className="text-[11px] text-sc-mute hover:text-sc-text active:text-sc-accent flex items-center gap-1.5 disabled:opacity-50"
          disabled={refreshing}
        >
          <RefreshIcon spinning={refreshing} />
          <span className="font-hindi">{relativeTimeHindi(data.generatedAt)}</span>
        </button>
      </div>

      {/* horizontal rail */}
      <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar snap-x snap-mandatory">
        {tags.map((t, i) => (
          <StoryCard key={t.slug} tag={t} rank={i + 1} isTop={i === 0} />
        ))}
      </div>

      {/* meta strip */}
      <div className="flex items-center gap-2 px-4 pt-3 text-[10px] text-sc-mute font-medium">
        <span>स्रोत:</span>
        {data.meta.sourcesUsed.map(s => (
          <span key={s} className="px-1.5 py-0.5 rounded-full bg-sc-card border border-sc-border">
            {s.replace('_', ' ')}
          </span>
        ))}
        <span className="ml-auto">{data.meta.rawSignalCount} signals</span>
      </div>

      {error && (
        <div className="px-4 pt-2 text-xs text-rose-400">रीफ़्रेश में दिक्कत: {error}</div>
      )}
    </section>
  );
}

function RailSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="shrink-0 w-36 h-52 rounded-2xl shimmer" />
      ))}
    </div>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      className={spinning ? 'animate-spin' : ''}
    >
      <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}
