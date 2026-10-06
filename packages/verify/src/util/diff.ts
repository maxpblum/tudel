/**
 * Minimal line diff (LCS) for readable snapshot and formatter mismatch reports.
 */
export function lineDiff(expected: string[], actual: string[], context = 2, maxLines = 60): string {
  const n = expected.length;
  const m = actual.length;
  // LCS table; content snippets are small, so O(n*m) is fine. Guard against huge inputs.
  if (n * m > 4_000_000) return `  (too large to diff: expected ${n} lines, got ${m} lines)`;
  const dp: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i]![j] = expected[i] === actual[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
  const ops: { op: ' ' | '-' | '+'; line: string }[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (expected[i] === actual[j]) {
      ops.push({ op: ' ', line: expected[i]! });
      i++;
      j++;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) ops.push({ op: '-', line: expected[i++]! });
    else ops.push({ op: '+', line: actual[j++]! });
  }
  while (i < n) ops.push({ op: '-', line: expected[i++]! });
  while (j < m) ops.push({ op: '+', line: actual[j++]! });
  const keep = new Array(ops.length).fill(false);
  ops.forEach((o, k) => {
    if (o.op !== ' ') for (let d = -context; d <= context; d++) if (k + d >= 0 && k + d < ops.length) keep[k + d] = true;
  });
  const out: string[] = [];
  let skipped = false;
  ops.forEach((o, k) => {
    if (!keep[k]) {
      if (!skipped) out.push('    ...');
      skipped = true;
      return;
    }
    skipped = false;
    out.push(`  ${o.op} ${o.line}`);
  });
  if (out.length > maxLines) return [...out.slice(0, maxLines), `    ... (${out.length - maxLines} more diff lines)`].join('\n');
  return out.join('\n');
}
