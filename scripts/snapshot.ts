import { runPipeline } from '../lib/pipeline';
import { promises as fs } from 'fs';

(async () => {
  const p = await runPipeline();
  const lines: string[] = [];
  lines.push(`ShareChat — अभी ट्रेंडिंग`);
  lines.push(`Generated: ${new Date(p.generatedAt).toISOString()}`);
  lines.push(`Sources: ${p.meta.sourcesUsed.join(', ')}  |  ${p.meta.rawSignalCount} signals  |  ${p.meta.durationMs}ms`);
  lines.push('');
  p.tags.forEach((t, i) => {
    lines.push(`${(i + 1).toString().padStart(2, ' ')}. ${t.hashtag.padEnd(28)} 🔥 ${t.heat.toString().padStart(3)}  [${t.category}]`);
    lines.push(`    ${t.hindi}`);
    lines.push(`    ${t.description}`);
    lines.push(`    sources: ${t.sources.join(', ')}`);
    lines.push('');
  });
  const out = lines.join('\n');
  console.log(out);
  await fs.writeFile('snapshot.txt', out, 'utf-8');
  console.log('Saved to snapshot.txt');
})();
