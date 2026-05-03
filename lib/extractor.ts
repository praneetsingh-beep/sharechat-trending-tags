import type { RawSignal } from './types';

/**
 * Tag extractor — turns long-form signal text (news headlines, reddit titles)
 * into short canonical entities. Two-stage:
 *
 *   1. Cheap rule-based extraction: capitalised noun phrases, hashtag candidates,
 *      named entities by proper-noun pattern.
 *   2. Cluster signals into entity groups via fuzzy match (lowercase + token Jaccard).
 *
 * We deliberately avoid heavy NLP libs at this stage — they're expensive in
 * Vercel functions and adequate for a feed where ~30 raw entities collapse
 * into ~10 tags. The Hindi/categorisation LLM call later does the polishing.
 */

export interface EntityCluster {
  /** Canonical English form (most-mentioned variant) */
  canonical: string;
  /** All variants seen */
  variants: Set<string>;
  /** Signals supporting this cluster */
  signals: RawSignal[];
}

const STOPWORDS = new Set([
  'the','a','an','of','in','on','at','to','for','and','or','but','is','was','are','were',
  'be','been','being','have','has','had','do','does','did','will','would','should','could',
  'may','might','must','shall','can','this','that','these','those','i','you','he','she','it',
  'we','they','what','which','who','when','where','why','how','all','each','every','some','any',
  'more','most','other','another','such','no','nor','not','only','own','same','so','than','too',
  'very','says','said','say','today','yesterday','breaking','news','live','update','report',
  'reports','watch','video','photos','exclusive','latest','full','new'
]);

/**
 * Pull candidate entities from a signal. Returns 1+ candidate strings.
 *
 * Strategies:
 *   - Google Trends and Wikipedia signals ARE entities — use as-is.
 *   - Long news/reddit titles: extract Capitalised-Word runs (incl. "vs"/"v" connectors)
 *     of length 2-5 — those are the proper-noun phrases. We deliberately skip
 *     single-word candidates from long titles to avoid generic noise like "India".
 */
const CONNECTOR_TOKENS = new Set(['vs', 'v', 'and', '&', 'of', 'in', 'on', 'for']);

export function extractCandidates(signal: RawSignal): string[] {
  const text = signal.term;
  const wordCount = text.trim().split(/\s+/).length;

  // Short signals (Google Trends, Wikipedia article names) ARE the entity.
  if (signal.source === 'google_trends' || signal.source === 'wikipedia') {
    return [text.trim()];
  }

  if (wordCount <= 4) return [text.trim()];

  // Long signals (news/reddit titles): pull capitalised noun phrases.
  const candidates: string[] = [];
  const tokens = text.split(/\s+/);
  let run: string[] = [];
  let lastWasConnector = false;
  for (const tok of tokens) {
    const clean = tok.replace(/[^A-Za-z0-9'-]/g, '');
    const lower = clean.toLowerCase();
    const isCap = /^[A-Z]/.test(clean) && clean.length > 1 && !STOPWORDS.has(lower);
    const isConnector = CONNECTOR_TOKENS.has(lower);

    if (isCap) {
      run.push(clean);
      lastWasConnector = false;
    } else if (isConnector && run.length > 0) {
      // Allow one connector inside a run: "India vs Australia"
      run.push(lower);
      lastWasConnector = true;
    } else {
      // Trim trailing connector before pushing
      while (run.length && CONNECTOR_TOKENS.has(run[run.length - 1].toLowerCase())) run.pop();
      if (run.length >= 2 && run.length <= 5) candidates.push(run.join(' '));
      run = [];
      lastWasConnector = false;
    }
  }
  while (run.length && CONNECTOR_TOKENS.has(run[run.length - 1].toLowerCase())) run.pop();
  if (run.length >= 2 && run.length <= 5) candidates.push(run.join(' '));

  // If no multi-word caps found, fall back to the longest single proper noun
  if (candidates.length === 0) {
    const longCaps = tokens
      .map(t => t.replace(/[^A-Za-z0-9'-]/g, ''))
      .filter(t => /^[A-Z]/.test(t) && t.length > 4 && !STOPWORDS.has(t.toLowerCase()));
    if (longCaps.length) candidates.push(longCaps[0]);
    else candidates.push(text.split(/[—:|–-]/)[0].trim());
  }
  return candidates;
}

/** Normalise for similarity comparison */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenSet(s: string): Set<string> {
  return new Set(norm(s).split(' ').filter(t => t && !STOPWORDS.has(t)));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

/**
 * Cluster signals by entity similarity. Two entities cluster if Jaccard ≥ 0.5
 * OR one is a contiguous substring of the other.
 */
export function clusterSignals(signals: RawSignal[]): EntityCluster[] {
  const clusters: EntityCluster[] = [];

  for (const sig of signals) {
    const candidates = extractCandidates(sig);
    for (const cand of candidates) {
      if (cand.length < 3 || cand.length > 60) continue;
      const candTokens = tokenSet(cand);
      if (candTokens.size === 0) continue;

      // Find best matching cluster.
      // Match rule: Jaccard >= 0.6 (strong overlap) OR substring with ≥2 token overlap
      // (prevents "India" from collapsing into "India vs Australia").
      let bestIdx = -1;
      let bestScore = 0;
      for (let i = 0; i < clusters.length; i++) {
        const c = clusters[i];
        for (const v of c.variants) {
          const vTokens = tokenSet(v);
          let inter = 0;
          for (const x of candTokens) if (vTokens.has(x)) inter++;
          const j = inter / (candTokens.size + vTokens.size - inter);
          const minSize = Math.min(candTokens.size, vTokens.size);
          const sub =
            (norm(cand).includes(norm(v)) || norm(v).includes(norm(cand))) &&
            inter >= 2 &&
            inter / minSize >= 0.8;
          const score = Math.max(j, sub ? 0.65 : 0);
          if (score > bestScore) {
            bestScore = score;
            bestIdx = i;
          }
        }
      }

      if (bestScore >= 0.6 && bestIdx >= 0) {
        const c = clusters[bestIdx];
        c.variants.add(cand);
        if (!c.signals.includes(sig)) c.signals.push(sig);
      } else {
        clusters.push({
          canonical: cand,
          variants: new Set([cand]),
          signals: [sig]
        });
      }
    }
  }

  // Pick canonical as the most-frequent or shortest variant
  for (const c of clusters) {
    const variantCounts: Record<string, number> = {};
    for (const v of c.variants) variantCounts[v] = (variantCounts[v] ?? 0) + 1;
    c.canonical = [...c.variants].sort((a, b) => {
      const ca = variantCounts[a] ?? 0;
      const cb = variantCounts[b] ?? 0;
      if (cb !== ca) return cb - ca;
      return a.length - b.length;
    })[0];
  }

  return clusters;
}
