// Strips machine-specific absolute paths from jsdoc output and drops undocumented entries,
// so doc.json is byte-identical no matter where the clone lives.
import { readFileSync, writeFileSync } from 'node:fs';
const [, , input, output] = process.argv;
const doc = JSON.parse(readFileSync(input, 'utf8'));
const rel = (p) => p.replace(/^.*?\/packages\//, 'packages/').replace(/^.*\/packages$/, 'packages');
const docs = doc.docs
  .filter((d) => !d.undocumented)
  .map((d) => {
    if (d.meta?.path) d.meta.path = rel(d.meta.path);
    if (d.meta) delete d.meta.code;
    // the `package` entry lists every source file by absolute path
    if (Array.isArray(d.files)) d.files = d.files.map(rel);
    return d;
  });
writeFileSync(output, JSON.stringify({ docs }, null, 1) + '\n');
