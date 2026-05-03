export type SignalSource =
  | 'google_trends'
  | 'newsapi'
  | 'reddit_india'
  | 'wikipedia'
  | 'gdelt';

export type Category =
  | 'sports'
  | 'news'
  | 'entertainment'
  | 'politics'
  | 'finance'
  | 'tech'
  | 'devotional'
  | 'festival'
  | 'weather'
  | 'lifestyle'
  | 'other';

/** Raw signal from a single source */
export interface RawSignal {
  source: SignalSource;
  /** Original term as the source named it (English usually) */
  term: string;
  /** Optional context — article headline, post title */
  context?: string;
  /** Source-side strength: search volume, upvotes, mentions count */
  strength?: number;
  /** Unix ms */
  fetchedAt: number;
  /** When the source itself last updated */
  publishedAt?: number;
  /** Origin URL if applicable */
  url?: string;
}

/** A canonicalized tag fused from many signals */
export interface FusedTag {
  /** Canonical English slug — used as the tag id */
  slug: string;
  /** Canonical English term, e.g. "India vs Australia" */
  canonical: string;
  /** Hindi rendition for display, e.g. "भारत बनाम ऑस्ट्रेलिया" */
  hindi: string;
  /** Hashtag form for display: #IndiaVsAustralia */
  hashtag: string;
  /** Short Hindi description (1 line) */
  description: string;
  category: Category;
  /** 0-100 heat score */
  heat: number;
  /** Sources that contributed signals */
  sources: SignalSource[];
  /** Underlying signal strength stats */
  signals: {
    sourceCount: number;
    velocity: number; // 0-1
    newsRecencyHrs: number;
    engagement: number; // normalized 0-1
    indiaSpecificity: number; // 0-1
  };
  /** Optional: one related content piece for the bonus */
  related?: {
    title: string;
    snippet: string;
    url?: string;
    aiSummary?: string;
  };
  /** Unix ms — when this fused tag was assembled */
  computedAt: number;
}

export interface TrendsPayload {
  generatedAt: number;
  tags: FusedTag[];
  /** Diagnostic metadata for the UI to show "last updated X mins ago" */
  meta: {
    sourcesUsed: SignalSource[];
    rawSignalCount: number;
    durationMs: number;
  };
}
