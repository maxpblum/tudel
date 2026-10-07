import type { Block, BundleVariant } from '@tudel/content-schema';

/** Plain text of an HTML fragment (tags dropped, common entities decoded, whitespace collapsed). */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Prose of a block list: html blocks, play labels, compare diffs and bridges. Code is not prose. */
export function blocksText(blocks: readonly Block[]): string {
  const parts: string[] = [];
  for (const b of blocks) {
    if (b.kind === 'html') parts.push(stripHtml(b.html));
    else if (b.kind === 'play' && b.label) parts.push(b.label);
    else if (b.kind === 'compare') parts.push(b.diff);
    else if (b.kind === 'bridge') parts.push(b.title ?? '', blocksText(b.blocks));
  }
  return parts.filter(Boolean).join(' ');
}

/** Prompt prose plus listen-for items of a variant. */
export function variantText(v: BundleVariant): string {
  return [blocksText(v.prompt), ...v.listenFor].join(' ');
}
