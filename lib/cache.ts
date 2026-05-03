import type { TrendsPayload } from './types';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Lightweight cache. On Vercel we use the writable /tmp dir for per-invocation
 * persistence within a region (good enough for a 30-min cron). For local dev
 * we use ./data/cache.json so successive `npm run dev` calls reuse the result.
 *
 * For a real production system we'd swap this for Vercel KV / Upstash Redis —
 * I've kept the interface shaped so that swap is a 10-line change.
 */

const FILE = process.env.VERCEL
  ? '/tmp/sharechat-trends-cache.json'
  : path.join(process.cwd(), 'data', 'cache.json');

export async function readCache(): Promise<TrendsPayload | null> {
  try {
    const buf = await fs.readFile(FILE, 'utf-8');
    return JSON.parse(buf) as TrendsPayload;
  } catch {
    return null;
  }
}

export async function writeCache(payload: TrendsPayload): Promise<void> {
  try {
    if (!process.env.VERCEL) {
      await fs.mkdir(path.dirname(FILE), { recursive: true });
    }
    await fs.writeFile(FILE, JSON.stringify(payload), 'utf-8');
  } catch (err) {
    console.warn('[cache] write failed:', (err as Error).message);
  }
}
