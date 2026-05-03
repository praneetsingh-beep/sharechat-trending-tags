import { runPipeline } from '../lib/pipeline';

(async () => {
  const payload = await runPipeline();
  console.log(`Generated ${payload.tags.length} tags in ${payload.meta.durationMs}ms`);
  console.log(`Sources used: ${payload.meta.sourcesUsed.join(', ')}`);
  console.log(`Raw signals: ${payload.meta.rawSignalCount}`);
  console.log('\n--- TRENDING ---\n');
  payload.tags.forEach((t, i) => {
    console.log(`${i + 1}. ${t.hashtag}  [heat: ${t.heat}]`);
    console.log(`   ${t.hindi}`);
    console.log(`   ${t.description}`);
    console.log(`   category: ${t.category}  sources: ${t.sources.join(', ')}`);
    console.log('');
  });
})();
