import type { Category } from './types';

/** Category → emoji + gradient pair (for the story-card backgrounds) */
export const CATEGORY_META: Record<Category, { icon: string; label: string; gradient: string; chip: string }> = {
  sports:        { icon: '🏏', label: 'खेल',       gradient: 'from-orange-500 via-red-500 to-pink-600',  chip: 'bg-orange-500/15 text-orange-300 border-orange-500/30' },
  news:          { icon: '📰', label: 'समाचार',    gradient: 'from-slate-600 via-slate-700 to-slate-900', chip: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
  entertainment: { icon: '🎬', label: 'मनोरंजन',   gradient: 'from-fuchsia-500 via-pink-600 to-rose-700', chip: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30' },
  politics:      { icon: '🏛️', label: 'राजनीति',    gradient: 'from-amber-600 via-orange-700 to-red-800',  chip: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  finance:       { icon: '💹', label: 'कारोबार',   gradient: 'from-emerald-500 via-green-600 to-teal-800', chip: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  tech:          { icon: '💻', label: 'टेक',        gradient: 'from-cyan-500 via-blue-600 to-indigo-800',   chip: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  devotional:    { icon: '🪔', label: 'भक्ति',      gradient: 'from-yellow-500 via-amber-600 to-orange-700', chip: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' },
  festival:      { icon: '🎉', label: 'त्योहार',    gradient: 'from-pink-500 via-rose-600 to-red-700',     chip: 'bg-pink-500/15 text-pink-300 border-pink-500/30' },
  weather:       { icon: '🌧️', label: 'मौसम',       gradient: 'from-sky-500 via-blue-600 to-slate-800',    chip: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  lifestyle:     { icon: '✨', label: 'लाइफस्टाइल', gradient: 'from-violet-500 via-purple-600 to-fuchsia-700', chip: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
  other:         { icon: '🔥', label: 'ट्रेंडिंग',   gradient: 'from-zinc-600 via-zinc-700 to-zinc-900',    chip: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30' }
};

/** Heat tier visual */
export function heatTier(heat: number): { flames: string; label: string; color: string } {
  if (heat >= 75) return { flames: '🔥🔥🔥', label: 'जबरदस्त', color: 'text-rose-400' };
  if (heat >= 55) return { flames: '🔥🔥',   label: 'तेज़',     color: 'text-orange-400' };
  if (heat >= 35) return { flames: '🔥',      label: 'चढ़ता',    color: 'text-amber-400' };
  return            { flames: '✨',           label: 'उभरता',    color: 'text-yellow-200' };
}

/** "X मिनट पहले" relative-time formatter (Hindi) */
export function relativeTimeHindi(ms: number): string {
  const diff = Date.now() - ms;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'अभी अभी';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} मिनट पहले`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} घंटे पहले`;
  const day = Math.floor(hr / 24);
  return `${day} दिन पहले`;
}

/** Source pill labels in Hindi */
export const SOURCE_LABELS: Record<string, string> = {
  google_trends: 'Google खोज',
  newsapi: 'समाचार',
  reddit_india: 'Reddit',
  wikipedia: 'विकिपीडिया',
  gdelt: 'GDELT'
};
