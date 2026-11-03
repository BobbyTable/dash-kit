// @bobbytable/dash-kit · icons — Lucide (https://lucide.dev, ISC) as inline SVG strings, styled by css/icons.css (.ic).
// The icon set isn't bundled: import just the icons you use from 'lucide' (tree-shaken), or load Lucide's UMD build on a
// plain page and pass names.
//   import { icon } from '@bobbytable/dash-kit/icons';  import { Cctv } from 'lucide';
//   el.innerHTML = icon(Cctv) + ' Cameras';   icon('Cctv')  (UMD)   icon(Cctv, { size: 20, label: 'Cameras', class: 'ok' })
// Angular: [innerHTML]="sanitizer.bypassSecurityTrustHtml(icon(Cctv))", or hydrateIcons(el) in ngAfterViewInit.

/** a Lucide icon node: [tag, attributes][] */
export type IconNode = [string, Record<string, string | number>][];
export interface IconOptions { size?: number; label?: string; class?: string }

const ATTR = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const escAttr = (s: unknown) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function resolve(x: IconNode | string): IconNode {
  if (Array.isArray(x)) return x;
  const node = (globalThis as { lucide?: { icons?: Record<string, IconNode> } }).lucide?.icons?.[x];
  if (!node) console.warn(`[dash-kit] icon "${x}" not found — import it from 'lucide' and pass the node, or load the Lucide UMD build`);
  return node || [];
}

/** inline SVG string <svg class="ic …">; size in px (default: css, 1.15 em); a label makes it announced, else aria-hidden */
export function icon(x: IconNode | string, { size, label, class: cls }: IconOptions = {}): string {
  const body = resolve(x).map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${escAttr(v)}"`).join(' ')}/>`).join('');
  const dims = size ? ` style="width:${+size}px;height:${+size}px"` : '';   // inline style: beats the .ic default (attributes would not)
  const a11y = label ? ` role="img" aria-label="${escAttr(label)}"` : ' aria-hidden="true"';
  return `<svg class="ic${cls ? ' ' + escAttr(cls) : ''}" ${ATTR}${dims}${a11y}>${body}</svg>`;
}

/** replace every <i data-icon="Name"> under root with its SVG (names via window.lucide, or pass a { Name: node } map) */
export function hydrateIcons(root: Document | Element = document, icons?: Record<string, IconNode>): void {
  for (const el of root.querySelectorAll<HTMLElement>('[data-icon]')) {
    const n = el.dataset.icon ?? '', node = icons?.[n] ?? n;
    el.outerHTML = icon(node, { label: el.getAttribute('aria-label') || undefined, class: el.className || undefined });
  }
}
