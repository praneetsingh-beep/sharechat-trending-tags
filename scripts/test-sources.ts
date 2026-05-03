import { fetchAllSignals } from '../lib/sources';

(async () => {
  const t0 = Date.now();
  const signals = await fetchAllSignals();
  const ms = Date.now() - t0;
  const bySource: Record<string, number> = {};
  for (const s of signals) bySource[s.source] = (bySource[s.source] ?? 0) + 1;
  console.log(`Fetched ${signals.length} signals in ${ms}ms`);
  console.log('By source:', bySource);
  console.log('\nSample (first 5 from each source):');
  for (const src of Object.keys(bySource)) {
    console.log(`\n--- ${src} ---`);
    for (const s of signals.filter(x => x.source === src).slice(0, 5)) {
      console.log(`  • ${s.term} ${s.strength ? `[${s.strength}]` : ''}`);
    }
  }
})();
