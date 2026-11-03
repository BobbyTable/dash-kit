// @bobbytable/dash-kit · markup helpers (HTML strings): threshold meter, key/value list, bar row (tooltips: bars.ts)
import { esc } from './format';

/** threshold meter: blue up to warn, yellow up to error, red beyond; ticks mark both. Put it in <div class="meter">. */
export function meter(pct: number | null | undefined, w?: number | null, e?: number | null): string {
  const p = Math.max(0, Math.min(100, pct ?? 0)), seg = (a: number, b: number) => Math.max(0, Math.min(p, b) - a);
  return `<i style="width:${seg(0, w ?? 100)}%"></i>` +
    (w != null ? `<i class="warn" style="width:${seg(w, e ?? 100)}%"></i>` : '') +
    (e != null ? `<i class="error" style="width:${seg(e, 100)}%"></i>` : '') +
    (w != null ? `<b class="warn" style="left:${w}%"></b>` : '') + (e != null ? `<b class="error" style="left:${e}%"></b>` : '');
}

/** key/value list; values are HTML (escape your own), falsy rows are skipped */
export const kv = (rows: Array<[string, string] | null | undefined | false>): string =>
  `<dl class="kv">${rows.filter((r): r is [string, string] => !!r).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join('')}</dl>`;

/** one bar of a bar row: m = tooltip title, n = height value, v + u = tooltip value + unit, cls = extra class on the bar */
export interface BarCell { m: string; n?: number | null; v: string | number; u?: string; cls?: string }
/** a row of thin bars with hover/tap/drag tooltips (call installBarTips() once); top = value of a full bar (default: the max) */
export function bars(cells: BarCell[], top?: number): string {
  const max = top || Math.max(1, ...cells.map(c => c.n || 0));
  return `<div class="pbars">${cells.map(c => `<span data-m="${esc(c.m)}" data-v="${esc(c.v)}" data-u="${esc(c.u)}"><i style="height:${Math.max(c.n ? 8 : 2, 100 * (c.n || 0) / max)}%" class="${c.n ? '' : 'z'} ${c.cls || ''}"></i></span>`).join('')}<div class="tip" hidden></div></div>`;
}
