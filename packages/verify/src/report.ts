/** Text reports for the CLI: the full run summary and the per-item `--explain` view. */
import { GATE_TITLES, type GateResult } from './gates/result.js';

function indent(s: string, pad = '      ') {
  return s.split('\n').join(`\n${pad}`);
}

export function formatReport(results: GateResult[]): string {
  const lines: string[] = [];
  for (const r of results) {
    const fails = r.failures;
    const items = new Set(r.entries.map((e) => e.item));
    const failedItems = new Set(fails.map((e) => e.item));
    lines.push(`${r.ok ? 'PASS' : 'FAIL'}  ${r.gate.padEnd(5)} ${GATE_TITLES[r.gate].padEnd(22)} ${r.entries.length - fails.length} checks passed, ${fails.length} failed (${items.size - failedItems.size}/${items.size} items clean)`);
    for (const f of fails) lines.push(`        x ${f.item}${f.where ? ` [${f.where}]` : ''}: ${indent(f.message)}`);
  }
  const failed = results.filter((r) => !r.ok);
  lines.push('');
  lines.push(failed.length ? `verify FAILED: ${failed.map((r) => r.gate).join(', ')}` : 'verify passed: all gates green');
  return lines.join('\n');
}

export function formatExplain(id: string, results: GateResult[]): { text: string; found: boolean; ok: boolean } {
  const lines = [`Explain ${id}`, ''];
  let found = false;
  let ok = true;
  for (const r of results) {
    const mine = r.entries.filter((e) => e.item === id);
    if (!mine.length) {
      lines.push(`  ----  ${r.gate.padEnd(5)} ${GATE_TITLES[r.gate]}: not applicable`);
      continue;
    }
    found = true;
    const bad = mine.filter((e) => !e.ok);
    if (bad.length) ok = false;
    lines.push(`  ${bad.length ? 'FAIL' : 'PASS'}  ${r.gate.padEnd(5)} ${GATE_TITLES[r.gate]}`);
    for (const e of mine) lines.push(`          ${e.ok ? 'ok' : 'x '} ${e.where ? `[${e.where}] ` : ''}${indent(e.message, '             ')}`);
  }
  if (!found) lines.push('', `No gate checked an item with id "${id}". Is the id right (variant or lesson id, e.g. snd.waveforms.v01)?`);
  return { text: lines.join('\n'), found, ok: found && ok };
}
