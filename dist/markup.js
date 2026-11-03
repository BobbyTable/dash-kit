import { esc } from "./format.js";
// src/markup.ts
/** threshold meter: blue up to warn, yellow up to error, red beyond; ticks mark both. Put it in <div class="meter">. */
function meter(pct, w, e) {
	const p = Math.max(0, Math.min(100, pct ?? 0)), seg = (a, b) => Math.max(0, Math.min(p, b) - a);
	return `<i style="width:${seg(0, w ?? 100)}%"></i>` + (w != null ? `<i class="warn" style="width:${seg(w, e ?? 100)}%"></i>` : "") + (e != null ? `<i class="error" style="width:${seg(e, 100)}%"></i>` : "") + (w != null ? `<b class="warn" style="left:${w}%"></b>` : "") + (e != null ? `<b class="error" style="left:${e}%"></b>` : "");
}
/** key/value list; values are HTML (escape your own), falsy rows are skipped */
var kv = (rows) => `<dl class="kv">${rows.filter((r) => !!r).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join("")}</dl>`;
/** a row of thin bars with hover/tap/drag tooltips (call installBarTips() once); top = value of a full bar (default: the max) */
function bars(cells, top) {
	const max = top || Math.max(1, ...cells.map((c) => c.n || 0));
	return `<div class="pbars">${cells.map((c) => `<span data-m="${esc(c.m)}" data-v="${esc(c.v)}" data-u="${esc(c.u)}"><i style="height:${Math.max(c.n ? 8 : 2, 100 * (c.n || 0) / max)}%" class="${c.n ? "" : "z"} ${c.cls || ""}"></i></span>`).join("")}<div class="tip" hidden></div></div>`;
}
export { bars, kv, meter };

//# sourceMappingURL=markup.js.map