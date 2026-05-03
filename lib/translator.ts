import Anthropic from '@anthropic-ai/sdk';
import type { RankedCluster } from './ranker';
import { heuristicCategory } from './ranker';
import type { Category, FusedTag, RawSignal } from './types';
import { toHashtag, toSlug } from './ranker';

/**
 * Hindi enrichment layer. One Claude call enriches the entire ranked list with:
 *   - Hindi rendition of the canonical name
 *   - 1-line Hindi description
 *   - Category (sports/news/festival/...)
 *   - AI summary for the bonus content card
 *
 * Falls back to a deterministic non-LLM path when ANTHROPIC_API_KEY is absent
 * (keeps the prototype usable in zero-cost demo mode).
 */

interface EnrichInput {
  slug: string;
  canonical: string;
  topContext: string;
}

interface EnrichOutput {
  slug: string;
  hindi: string;
  description: string;
  category: Category;
  aiSummary: string;
}

const SYSTEM_PROMPT = `You are an editor for ShareChat, India's largest Hindi-first social platform.
You translate English trending topics into the Hindi a Bharat user would actually say.

Rules:
- Use natural Hindi/Hinglish — what people say, not pure शुद्ध हिंदी.
- Proper nouns (cricket players, brands, places, films) stay as-is in Devanagari transliteration.
  e.g. "India vs Australia" → "भारत बनाम ऑस्ट्रेलिया" (NOT "इंडिया वर्सेस ऑस्ट्रेलिया").
- Description must be ≤12 Hindi words and tell the user WHY this is trending today.
- aiSummary must be 2-3 sentences in Hindi, factual, no speculation.
- Category from this exact set: sports, news, entertainment, politics, finance, tech, devotional, festival, weather, lifestyle, other.
- Output VALID JSON only. No markdown, no code fence, no commentary.`;

export async function enrichWithHindi(ranked: RankedCluster[]): Promise<FusedTag[]> {
  const now = Date.now();

  const inputs: EnrichInput[] = ranked.slice(0, 15).map(r => ({
    slug: toSlug(r.cluster.canonical),
    canonical: r.cluster.canonical,
    topContext: pickTopContext(r.cluster.signals)
  }));

  let enrichments: Map<string, EnrichOutput>;
  if (process.env.ANTHROPIC_API_KEY) {
    enrichments = await callClaude(inputs);
  } else {
    console.warn('[translator] ANTHROPIC_API_KEY missing — using deterministic fallback');
    enrichments = new Map();
    for (const r of ranked.slice(0, 15)) {
      const slug = toSlug(r.cluster.canonical);
      enrichments.set(slug, fallbackOne(slug, r.cluster.canonical, r.cluster.signals));
    }
  }

  return ranked.slice(0, 15).map(r => {
    const slug = toSlug(r.cluster.canonical);
    const e = enrichments.get(slug) ?? fallbackOne(slug, r.cluster.canonical, r.cluster.signals);

    const sources = [...new Set(r.cluster.signals.map(s => s.source))];
    const fused: FusedTag = {
      slug,
      canonical: r.cluster.canonical,
      hindi: e.hindi,
      hashtag: toHashtag(r.cluster.canonical),
      description: e.description,
      category: e.category,
      heat: r.heat,
      sources,
      signals: r.signals,
      related: pickRelated(r.cluster.signals, e.aiSummary),
      computedAt: now
    };
    return fused;
  });
}

function pickTopContext(signals: RawSignal[]): string {
  // Prefer a news headline that's recent and substantive
  const news = signals.filter(s => s.source === 'newsapi').sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0))[0];
  if (news) return `${news.term}${news.context ? ' — ' + news.context : ''}`;
  const reddit = signals.filter(s => s.source === 'reddit_india').sort((a, b) => (b.strength ?? 0) - (a.strength ?? 0))[0];
  if (reddit) return reddit.term;
  const gt = signals.filter(s => s.source === 'google_trends')[0];
  if (gt) return gt.context ?? gt.term;
  return signals[0]?.term ?? '';
}

function pickRelated(signals: RawSignal[], aiSummary: string) {
  const news = signals
    .filter(s => s.source === 'newsapi' && s.url)
    .sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0))[0];
  if (news) {
    return {
      title: news.term,
      snippet: news.context ?? '',
      url: news.url,
      aiSummary
    };
  }
  const any = signals.find(s => s.url);
  return {
    title: signals[0]?.term ?? '',
    snippet: signals[0]?.context ?? '',
    url: any?.url,
    aiSummary
  };
}

async function callClaude(inputs: EnrichInput[]): Promise<Map<string, EnrichOutput>> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const userMsg = `For each trending English topic below, output a JSON array of objects with keys:
slug, hindi, description, category, aiSummary.

Maintain the exact slug for each entry — do not change it.

Inputs:
${JSON.stringify(inputs, null, 2)}

Output JSON array only.`;

  const resp = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMsg }]
  });

  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('');

  // Strip any code fences just in case
  const jsonText = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

  let parsed: EnrichOutput[];
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    console.error('[translator] failed to parse Claude response:', text.slice(0, 500));
    throw err;
  }

  const map = new Map<string, EnrichOutput>();
  for (const e of parsed) {
    if (!e.slug) continue;
    map.set(e.slug, {
      slug: e.slug,
      hindi: e.hindi || e.slug,
      description: e.description || '',
      category: (e.category as Category) || 'news',
      aiSummary: e.aiSummary || ''
    });
  }
  return map;
}

/** Deterministic fallback when no API key — used so demo never fails. */
function fallbackEnrichments(inputs: EnrichInput[]): Map<string, EnrichOutput> {
  const map = new Map<string, EnrichOutput>();
  for (const i of inputs) map.set(i.slug, fallbackOne(i.slug, i.canonical, []));
  return map;
}

// Per-slug category overrides for famous entities the regex misses
const ENTITY_CATEGORY: Record<string, Category> = {
  'india-vs-australia': 'sports',
  'india-vs-pakistan': 'sports',
  'mumbai-rains': 'weather',
  'whatsapp-down': 'tech',
  'whatsapp': 'tech'
};

function fallbackOne(slug: string, canonical: string, signals: RawSignal[]): EnrichOutput {
  // Curated transliterations for high-frequency entities
  const HINDI_MAP: Record<string, string> = {
    'india vs australia': 'भारत बनाम ऑस्ट्रेलिया',
    'mumbai rains': 'मुंबई की बारिश',
    'ipl auction 2026': 'आईपीएल नीलामी 2026',
    'akshaya tritiya 2026': 'अक्षय तृतीया 2026',
    'akshaya tritiya': 'अक्षय तृतीया',
    'rbi repo rate': 'आरबीआई रेपो रेट',
    'stranger things 5': 'स्ट्रेंजर थिंग्स 5',
    'stranger things': 'स्ट्रेंजर थिंग्स',
    'heeramandi 2': 'हीरामंडी 2',
    'heeramandi': 'हीरामंडी',
    'lok sabha session': 'लोकसभा सत्र',
    'whatsapp down': 'व्हाट्सएप डाउन',
    'char dham yatra': 'चार धाम यात्रा',
    'char dham': 'चार धाम',
    'india national cricket team': 'भारतीय क्रिकेट टीम',
    'indian premier league': 'इंडियन प्रीमियर लीग',
    'reserve bank of india': 'भारतीय रिज़र्व बैंक'
  };
  const key = canonical.toLowerCase().trim();
  const hindi = HINDI_MAP[key] ?? canonical;

  return {
    slug,
    hindi,
    description: `${canonical} की चर्चा अभी ट्रेंड में है`,
    category: ENTITY_CATEGORY[slug] ?? heuristicCategory(canonical, signals),
    aiSummary: `${canonical} को लेकर आज सोशल मीडिया और न्यूज़ पर खूब चर्चा हो रही है।`
  };
}
