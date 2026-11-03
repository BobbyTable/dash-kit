// @bobbytable/dash-kit · markup helpers (HTML strings): threshold meter, key/value list, bar row (tooltips: bars.js)
import { esc } from './format.js';
export function meter(pct, w, e) {
  const p = Math.max(0, Math.min(100, pct ?? 0)), seg = (a, b) => Math.max(0, Math.min(p, b) - a);
  return `<i style="width:${seg(0, w ?? 100)}%"></i>` +
    (w != null ? `<i class="warn" style="width:${seg(w, e ?? 100)}%"></i>` : '') +
    (e != null ? `<i class="error" style="width:${seg(e, 100)}%"></i>` : '') +
    (w != null ? `<b class="warn" style="left:${w}%"></b>` : '') + (e != null ? `<b class="error" style="left:${e}%"></b>` : '');
}

export const kv = rows => `<dl class="kv">${rows.filter(Boolean).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join('')}</dl>`;

export function bars(cells, top) {
  const max = top || Math.max(1, ...cells.map(c => c.n || 0));
  return `<div class="pbars">${cells.map(c => `<span data-m="${esc(c.m)}" data-v="${esc(c.v)}" data-u="${esc(c.u)}"><i style="height:${Math.max(c.n ? 8 : 2, 100 * (c.n || 0) / max)}%" class="${c.n ? '' : 'z'} ${c.cls || ''}"></i></span>`).join('')}<div class="tip" hidden></div></div>`;
}
