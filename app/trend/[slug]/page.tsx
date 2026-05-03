import Link from 'next/link';
import { notFound } from 'next/navigation';
import { runPipeline } from '@/lib/pipeline';
import { readCache } from '@/lib/cache';
import { CATEGORY_META, heatTier, SOURCE_LABELS, relativeTimeHindi } from '@/lib/ui';
import type { FusedTag } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getTag(slug: string): Promise<{ tag: FusedTag; updatedAt: number } | null> {
  const cached = await readCache();
  let payload = cached && Date.now() - cached.generatedAt < 30 * 60 * 1000 ? cached : null;
  if (!payload) {
    try { payload = await runPipeline(); } catch { payload = cached; }
  }
  if (!payload) return null;
  const tag = payload.tags.find(t => t.slug === slug);
  return tag ? { tag, updatedAt: payload.generatedAt } : null;
}

export default async function TrendDetail({ params }: { params: { slug: string } }) {
  const found = await getTag(params.slug);
  if (!found) notFound();
  const { tag, updatedAt } = found;
  const cat = CATEGORY_META[tag.category];
  const heat = heatTier(tag.heat);

  return (
    <main className="pb-24">
      {/* HERO — full-bleed gradient, big Hindi headline, heat */}
      <section className={`relative bg-gradient-to-br ${cat.gradient} pt-3 pb-6`}>
        <div className="px-4 flex items-center justify-between text-white/90">
          <Link href="/" className="flex items-center gap-1 text-sm font-semibold active:opacity-70">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            <span className="font-hindi">वापस</span>
          </Link>
          <button aria-label="Share" className="active:opacity-70">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
        </div>
        <div className="px-4 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">{cat.icon}</span>
            <span className="text-white/85 text-xs font-semibold uppercase tracking-wider">{cat.label}</span>
            <span className="text-white/85 text-xs font-semibold ml-2">{heat.flames} {heat.label}</span>
          </div>
          <h1 className="font-hindi text-[32px] leading-[1.15] font-extrabold text-white drop-shadow-md">
            {tag.hindi}
          </h1>
          <div className="mt-2 text-white/80 text-sm font-medium">{tag.hashtag}</div>
        </div>

        {/* heat dial */}
        <div className="px-4 mt-5 flex items-end gap-3">
          <div className="bg-white/15 backdrop-blur rounded-2xl px-4 py-3 border border-white/20">
            <div className="text-[10px] uppercase tracking-wider text-white/75">हीट स्कोर</div>
            <div className="text-3xl font-extrabold text-white leading-none">{tag.heat}<span className="text-base font-medium text-white/70">/100</span></div>
          </div>
          <div className="bg-white/15 backdrop-blur rounded-2xl px-4 py-3 border border-white/20 flex-1">
            <div className="text-[10px] uppercase tracking-wider text-white/75">स्रोत</div>
            <div className="text-lg font-bold text-white leading-tight">{tag.signals.sourceCount} स्वतंत्र स्रोत</div>
            <div className="text-[10px] text-white/70 mt-0.5">{tag.sources.length} platforms</div>
          </div>
        </div>
      </section>

      {/* WHY IT'S TRENDING */}
      <section className="px-4 pt-5">
        <h2 className="font-hindi text-base font-bold mb-2 text-sc-text">क्यों ट्रेंड कर रहा है</h2>
        <p className="font-hindi text-[15px] leading-relaxed text-sc-text/90">{tag.description}</p>
      </section>

      {/* AI SUMMARY (bonus) */}
      {tag.related?.aiSummary && (
        <section className="mx-4 mt-5 rounded-2xl border border-sc-border bg-sc-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">✨</span>
            <span className="text-[11px] uppercase tracking-wider text-sc-mute font-semibold">AI सारांश</span>
            <span className="ml-auto text-[10px] text-sc-mute">क्लॉड द्वारा</span>
          </div>
          <p className="font-hindi text-[14px] leading-relaxed text-sc-text/90">{tag.related.aiSummary}</p>
        </section>
      )}

      {/* RELATED NEWS / CONTENT */}
      {tag.related?.title && (
        <section className="px-4 pt-5">
          <h2 className="font-hindi text-base font-bold mb-2 text-sc-text">मुख्य खबर</h2>
          <a
            href={tag.related.url ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl border border-sc-border bg-sc-card p-4 active:scale-[0.99] transition"
          >
            <div className="text-[15px] font-semibold leading-snug text-sc-text">{tag.related.title}</div>
            {tag.related.snippet && (
              <div className="text-[13px] mt-1.5 text-sc-mute line-clamp-3">{tag.related.snippet}</div>
            )}
            {tag.related.url && (
              <div className="text-[11px] mt-3 text-sc-accent2 truncate">{new URL(tag.related.url).hostname} →</div>
            )}
          </a>
        </section>
      )}

      {/* SIGNAL TRANSPARENCY — what most candidates won't show */}
      <section className="px-4 pt-5">
        <h2 className="font-hindi text-base font-bold mb-2 text-sc-text">यह ट्रेंड कैसे बना</h2>
        <div className="rounded-2xl border border-sc-border bg-sc-card divide-y divide-sc-border">
          <SignalRow label="स्रोतों की संख्या" value={`${tag.signals.sourceCount} में से 4`} bar={tag.signals.sourceCount / 4} />
          <SignalRow label="वेलॉसिटी (हाल का शोर)" value={`${Math.round(tag.signals.velocity * 100)}%`} bar={tag.signals.velocity} />
          <SignalRow label="समाचार ताज़गी" value={`${tag.signals.newsRecencyHrs.toFixed(1)} घंटे`} bar={Math.exp(-tag.signals.newsRecencyHrs / 12)} />
          <SignalRow label="यूज़र एंगेजमेंट" value={`${Math.round(tag.signals.engagement * 100)}%`} bar={tag.signals.engagement} />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tag.sources.map(s => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-sc-card border border-sc-border text-sc-mute">
              {SOURCE_LABELS[s] ?? s}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pt-7 sticky bottom-0">
        <button className="w-full rounded-full bg-gradient-to-r from-sc-accent to-sc-accent2 text-white font-hindi font-bold py-3.5 shadow-lg shadow-sc-accent/30 active:scale-[0.98]">
          {tag.hashtag} पर पोस्ट करें
        </button>
        <div className="text-center text-[10px] text-sc-mute mt-2">
          अपडेट: {relativeTimeHindi(updatedAt)}
        </div>
      </section>
    </main>
  );
}

function SignalRow({ label, value, bar }: { label: string; value: string; bar: number }) {
  const pct = Math.max(0, Math.min(1, bar)) * 100;
  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-hindi text-[13px] text-sc-text/90">{label}</span>
        <span className="text-[12px] font-semibold text-sc-text tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-sc-border overflow-hidden">
        <div className="h-full bg-gradient-to-r from-sc-accent to-sc-accent2 rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
