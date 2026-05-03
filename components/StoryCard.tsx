'use client';

import Link from 'next/link';
import type { FusedTag } from '@/lib/types';
import { CATEGORY_META, heatTier } from '@/lib/ui';

/**
 * Horizontal story-style card. ShareChat's Bharat audience already knows the
 * story-rail interaction from Instagram/Snapchat — this borrows that language
 * but uses the gradient-coded category as the visual hook (vs photos).
 *
 * Why this design over a list:
 *   - Mobile-native, thumb-friendly horizontal scroll
 *   - Heat is read at-a-glance (flame emojis + size of card)
 *   - Hindi typography is the hero, English hashtag is supporting
 *   - Pulses the top tag so users immediately see "what's hot now"
 */
export function StoryCard({ tag, rank, isTop }: { tag: FusedTag; rank: number; isTop: boolean }) {
  const cat = CATEGORY_META[tag.category];
  const heat = heatTier(tag.heat);

  return (
    <Link
      href={`/trend/${tag.slug}`}
      className="shrink-0 snap-start"
      prefetch={false}
    >
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.gradient} ${
          isTop ? 'w-44 h-60' : 'w-36 h-52'
        } p-3 flex flex-col justify-between transition-transform active:scale-95`}
      >
        {/* top row: rank + heat */}
        <div className="flex items-start justify-between text-white/90">
          <span className="text-2xl">{cat.icon}</span>
          <div className="flex flex-col items-end">
            <span className={`text-xs font-semibold ${isTop ? 'flame' : ''}`}>{heat.flames}</span>
            <span className="text-[10px] mt-0.5 text-white/70">#{rank}</span>
          </div>
        </div>

        {/* hindi title */}
        <div>
          <div className="font-hindi font-bold leading-tight text-white text-xl drop-shadow">
            {tag.hindi}
          </div>
          <div className="text-[11px] mt-1 text-white/80 truncate">
            {tag.hashtag}
          </div>
        </div>

        {/* bottom: category chip */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-white/85">
            {cat.label}
          </span>
          <span className="text-[10px] text-white/70">{tag.heat}°</span>
        </div>

        {/* subtle vignette overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none rounded-2xl" />
      </div>
    </Link>
  );
}
